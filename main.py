import os
import subprocess

os.system('start client/index.html')

subprocess.Popen(["python", "OrganizationListAPI/main.py"])
subprocess.Popen(["python", "LogoEncoderAPI/main.py"])
subprocess.Popen(["python", "MusicAPI/main.py"])