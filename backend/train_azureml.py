from azureml.core import Run
from train import train_agent

run = Run.get_context()

# Run training loop
train_agent(iterations=10)

# Optionally log metrics
# run.log("reward", reward)