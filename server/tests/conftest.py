import pytest
from app import app
import json

@pytest.fixture
# Simulate a browser or Postman to make a request
def client():
    app.config['TESTING'] = True # Enable testing mode
    with app.test_client() as client:
        #The previous code set up the environment; the following code cleans up the environment.
        yield client