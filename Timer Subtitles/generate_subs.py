import os

def generate_srt(minutes):
    total_seconds = minutes * 60
    with open("countdown.srt", "w") as f:
        for i in range(total_seconds):
            remaining_minutes, remaining_seconds = divmod(total_seconds - i, 60)
            f.write(f"{i + 1}\n")
            f.write(f"00:{i // 60:02d}:{i % 60:02d},000 --> 00:{(i + 1) // 60:02d}:{(i + 1) % 60:02d},000\n")
            f.write(f"{remaining_minutes:02d}:{remaining_seconds:02d}\n\n")
        # The final subtitle should last one minute
        f.write(f"{total_seconds + 1}\n")
        f.write(f"00:{total_seconds // 60:02d}:{total_seconds % 60:02d},000 --> 00:{(total_seconds + 60) // 60:02d}:{(total_seconds + 60) % 60:02d},000\n")
        f.write("00:00\n")

if __name__ == "__main__":
    minutes = int(input("Enter the number of minutes: "))
    generate_srt(minutes)
    print("The countdown.srt file has been generated.")
