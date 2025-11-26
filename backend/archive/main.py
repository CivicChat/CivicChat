from ray.rllib.algorithms.ppo import PPO, PPOConfig
from .CivicChatEnv import CivicChatEnv

def train_agent(iterations=10):
    config = (
        PPOConfig()
        .environment(env=CivicChatEnv, env_config={})
        .framework("torch")
        .env_runners(num_env_runners=1)
    )

    trainer = PPO(config=config)

    for i in range(iterations):
        result = trainer.train()
        reward = result["episode_reward_mean"]
        print(f"Iteration {i}: reward = {reward:.2f}")

        # Optional: log to Azure ML if needed
        # from azureml.core import Run
        # run = Run.get_context()
        # run.log("reward", reward)

if __name__ == "__main__":
    train_agent()
