# Copyright (C) 2022 Nick Belling.
# Feel free to copy and modify this code as you see fit.

# Usage:
# python swap_next.py

# Assuming two directories called "Current" and "Rendered" exist next to this
# script, opens a file called "current.txt" (initializing it with the contents
# "0" if it does not exist), and reads the number inside out of it. Using that
# number, it then adds one to that number, wipes the contents of the "Current"
# directory, finds the "Rendered/[number]" directory, and copies its contents
# into the "Current" directory.
import os
import shutil

# Constants
SCRIPT_DIR = os.path.dirname(__file__)
CURRENT_DIR = os.path.join(SCRIPT_DIR, 'Current')
RENDERED_DIR = os.path.join(SCRIPT_DIR, 'Rendered')
CURRENT_INDEX_FILE = os.path.join(SCRIPT_DIR, 'current.txt')

# Create the "current.txt" file if it does not exist
if not os.path.exists(CURRENT_INDEX_FILE):
    with open(CURRENT_INDEX_FILE, 'w+') as file:
        file.write('0')

currentIndex = 0

# Get the "current" index (this represents the current contents of the "Current"
# directory)
with open(CURRENT_INDEX_FILE, 'r') as file:
    currentIndex = int(file.read())

# Work out what the next directory will be
currentIndex += 1
nextDirectory = os.path.join(RENDERED_DIR, str(currentIndex))

if not os.path.exists(nextDirectory):
    # Looks like the "next number" doesn't exist. Reset back to 1:
    currentIndex = 1
    nextDirectory = os.path.join(RENDERED_DIR, str(1))

# Delete the "Current" directory
shutil.rmtree(CURRENT_DIR)

# Copy the contents of the nextDirectory to "Current"
print(f'Copying the contents of /Rendered/{currentIndex} to /Current...')
shutil.copytree(nextDirectory, CURRENT_DIR)

# Set the "current.txt" file
with open(CURRENT_INDEX_FILE, 'w+') as file:
    file.write(str(currentIndex))
print('Done.')