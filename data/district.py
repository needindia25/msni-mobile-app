import json

# Load the states.json file
with open('states.json', 'r') as file:
    data = json.load(file)

# Initialize the result list
result = []

# Initialize primary key counter
pk_counter = 1

# Iterate over the states and districts
for state_index, state in enumerate(data['states'], start=1):
    for district in state['districts']:
        result.append({
            "model": "master.district",
            "pk": pk_counter,
            "fields": {
                "name": district,
                "state_id": state_index,
                "user_id": 1
            }
        })
        pk_counter += 1

# Save the result to a new JSON file
with open('districts.json', 'w') as file:
    json.dump(result, file, indent=4)

print("Conversion complete. The result is saved in 'districts.json'.")