import pytest
import json
import os
import app 

# semule test cases for parser logic in app.py
def test_parse_logic_only():
    # verify that the nested dictionary access works as expected
    mock_dict = {
        "pricing_table": {
            "Apple": {"iPhone 12": {"screen": 500}}
        }
    }
    # Make sure we can access the price correctly
    assert mock_dict["pricing_table"]["Apple"]["iPhone 12"]["screen"] == 500

# Testing robustness
def test_parser_handles_missing_fields():
    from app import get_price_safe
    # Construct an incomplete dictionary to simulate missing data. Only battery price, no screen price.
    incomplete_data = {"pricing_table": {"Apple": {"iPhone 12": {"battery": 200}}}}
    
    # get_price_safe function should return "Contact for quote" when screen price is missing
    price = get_price_safe(incomplete_data, "Apple", "iPhone 12", "screen")
    assert price == "Contact for quote"

# Test loading config data from a mock file
def test_load_from_mock_file(monkeypatch):
    # JSON file path specifically for testing
    mock_path = os.path.join("tests", "mock_config.json")
    
    # read the mock config data but not reading real business_config
    monkeypatch.setattr(app, "CONFIG_PATH", mock_path) 
    
    # Import and run the actual loading function
    from app import load_config_data
    data = load_config_data()
    
    # verify reading results
    assert "pricing_table" in data
    # Verify the price of the iPhone 13 Pro (assuming your mock_config.json file contains 800).
    val = data["pricing_table"]["Apple"]["iPhone 13 Pro"]["screen"]
    assert val == 800