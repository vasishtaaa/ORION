import os

# Folders to completely ignore
IGNORE_DIRS = {'node_modules', '.next', '.git', '.venv', '__pycache__'}
# File types to include
ALLOWED_EXT = {'.ts', '.tsx', '.css', '.py', '.json'}

output_file = 'vortex_full_codebase.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Remove ignored directories so os.walk doesn't even traverse them
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in ALLOWED_EXT):
                filepath = os.path.join(root, file)
                
                # Write a clear header for each file
                outfile.write(f"\n\n{'='*50}\n")
                outfile.write(f"FILE: {filepath}\n")
                outfile.write(f"{'='*50}\n\n")
                
                # Append the code
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Error reading file: {e}\n")

print(f"✅ Codebase successfully bundled into {output_file}")