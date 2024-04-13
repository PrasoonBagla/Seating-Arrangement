import pandas as pd

# Read the Excel file
file_path = 'courses_to_rooms_with_counts_allocation.xlsx' # replace with your actual file path
df = pd.read_excel(file_path)

# Hard capacities provided by the user
hard_capacities = {
    'A501': 36, 'A502': 36, 'A503': 36, 'A504': 0, 'A505': 25, 'A506': 25, 'A507': 36, 'A508': 36,
    'A601': 36, 'A602': 48, 'A603': 36, 'A604': 36, 'A605': 48,
    'C301': 36, 'C302': 36, 'C304': 25, 'C305': 25, 'C306': 36, 'C307': 36, 'C308': 36,
    'C401': 48, 'C402': 36, 'C403': 36, 'C404': 36, 'C405': 48,
    'DLT10': 60, 'DLT8': 60, 'DLT7': 60, 'DLT6': 54, 'DLT5': 54,
    'LT1': 70, 'LT2': 70, 'LT3': 70, 'LT4': 70,
    'CCz1': 71, 'CCz2': 71, 'CCz3': 66
}


# Initialize a dictionary to keep track of the number of students scheduled for each room in each time slot
room_occupancy = {room: {} for room in hard_capacities.keys()}

# Helper function to process the 'Rooms and Students' column and return a dictionary of room counts
def process_room_counts(room_counts_str):
    room_counts = {}
    for room_count in room_counts_str.split(','):
        room, count = room_count.strip().split(' ')
        room_counts[room] = int(count.strip('()'))
    return room_counts

# Process each row in the dataframe
for index, row in df.iterrows():
    date_time_slot = f"{row['Date']} {row['Time']}"
    room_counts = process_room_counts(row['Rooms and Students'])
    
    # Add room counts to the corresponding date and time slot
    for room, count in room_counts.items():
        if date_time_slot not in room_occupancy[room]:
            room_occupancy[room][date_time_slot] = 0
        room_occupancy[room][date_time_slot] += count

# Now, let's check for any capacity breaches
capacity_breaches = []

for room, occupancy in room_occupancy.items():
    for time_slot, count in occupancy.items():
        if count > hard_capacities[room]:
            capacity_breaches.append((room, time_slot, count, hard_capacities[room]))

# Output any capacity breaches
for breach in capacity_breaches:
    print(f"Capacity breach in {breach[0]} during {breach[1]}: {breach[2]} students, capacity {breach[3]}")
