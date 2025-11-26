import gymnasium as gym
from gymnasium.spaces import Discrete, Dict, Box
import numpy as np
from .data_loader import load_candidates, load_contests, load_precincts, load_results

class CivicChatEnv(gym.Env):
    def __init__(self, config=None):
        self.candidates = load_candidates()
        self.contests = load_contests()
        self.precincts = load_precincts()
        self.results = load_results()

        self.action_space = Discrete(len(self.candidates))  # each candidate = action

        self.observation_space = Dict({
            "location": Box(low=0, high=100, shape=(1,), dtype=np.float32),
            "interest": Discrete(5),  # housing, jobs, health, transport, disaster
            "contest": Discrete(len(self.contests)), # which contest is active
            "precinct": Discrete(len(self.precincts))
        })
        self.state = {
                    "location": np.array([50.0]), 
                    "interest": 0,
                    "contest": 0,
                    "precinct": 0
        }

    def reset(self):
        self.state = {
            "location": np.array([np.random.uniform(0, 100)]),
            "interest": np.random.randint(0, 5),
            "contest": np.random.randint(0, len(self.contests)),
            "precinct": np.random.randint(0, len(self.precincts))
        }
        return self.state

    def step(self, action):
        reward = self._simulate_feedback(action)
        done = False
        return self.state, reward, done, {}

    def _simulate_feedback(self, action):
        # Example: reward if candidate bio mentions interest keyword
        candidate = self.candidates[action]
        contest = self.contests[self.state["contest"]]
        precinct = self.precincts[self.state["precinct"]]

        interest_map = ["housing", "jobs", "health", "transport", "disaster"]
        keyword = interest_map[self.state["interest"]]
        reward = 1.0 if keyword.lower() in candidate["bio"].lower() else -0.5
        result = next(
            (r for r in self.results if r["precinct_id"] == precinct["precinct_id"]
             and r["contest_id"] == contest["id"]
             and r["candidate_id"] == candidate["id"]),
            None
        )

        # Bonus reward if contest is ward-level (more civic impact)
        if contest.get("office_level") == "ward" and precinct.get("wards") == "8":
            reward += 0.3

        # Reward based on votes (normalized) if available, otherwise keep bio-based reward
        if result:
            reward = result.get("votes", 0) / 100.0

        return reward
    
        
