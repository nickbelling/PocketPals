# Copyright (C) 2022, Nick Belling.
# Feel free to copy and modify this code as you see fit.

# Usage:
# python spreadsheet_to_json.py path/to/spreadsheet.xlsx

# Takes an Excel spreadsheet and converts it into a JSON array of obejcts.
# Assumes that the spreadsheet has a single sheet, and the first row is the
# title of each property in the objects.
import json
import pandas
import sys

if len(sys.argv) > 1:
    # File should be the first argument
    excel_file = sys.argv[1]

    # Read Excel document
    excel_data = pandas.read_excel(excel_file)

    # Convert to JSON string
    json_string = excel_data.to_json(orient='records')

    # Parse string as dictionary
    json_dict = json.loads(json_string)

    # Write JSON file
    with open('data.json', 'w') as json_file:
        json.dump(json_dict, json_file, indent=4)
else:
    print('Usage: spreadsheet_to_json.py path/to/file.xlsx')