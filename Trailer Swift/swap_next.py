# Copyright (C) 2022 Nick Belling.
# Feel free to copy and modify this code as you see fit.

# Usage:
# python swap_next.py

# Assuming a directory called "Rendered" exists next to this script, opens a 
# file called "current.txt" (initializing it with the contents "0" if it does 
# not exist), and reads the number inside out of it. Using that number, it then
# adds one to that number, deletes the file called "Rendered/current.mp4", finds
# the file "Rendered/[number].mp4", and copies that file to 
# "Rendered/current.mp4".
import os
import shutil

# Constants
SCRIPT_DIR = os.path.dirname(__file__)
RENDERED_DIR = os.path.join(SCRIPT_DIR, 'Rendered')
CURRENT_FILE = os.path.join(RENDERED_DIR, 'current.mp4')
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

# Work out what the next file will be
currentIndex += 1
nextFile = os.path.join(RENDERED_DIR, str(currentIndex) + ".mp4")

if not os.path.exists(nextFile):
    # Looks like the "next number" doesn't exist. Reset back to 1:
    currentIndex = 1
    nextDirectory = os.path.join(RENDERED_DIR, str(1) + ".mp4")

# Delete the "Current" file
if os.path.exists(CURRENT_FILE):
    os.remove(CURRENT_FILE)

# Copy the "nextFile" to "CURRENT_FILE"
print(f'Copying the file /Rendered/{currentIndex}.mp4 to /Rendered/current.mp4...')
shutil.copyfile(nextFile, CURRENT_FILE)

# Set the "current.txt" file
with open(CURRENT_INDEX_FILE, 'w+') as file:
    file.write(str(currentIndex))
print('Done.')