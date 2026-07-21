"""
HOS (Hours of Service) calculation engine.
Simulates a property-carrying driver's trip under the 70hr/8-day rule,
applying: 11-hour driving limit, 14-hour on-duty window, 30-min break
after 8 cumulative driving hours, 10 consecutive hours off duty between
work days, fueling every 1000 miles, and 1hr each for pickup/dropoff.
"""

AVG_SPEED_MPH = 55
FUEL_INTERVAL_MILES = 1000
FUEL_DURATION_HR = 0.5
PICKUP_DURATION_HR = 1
DROPOFF_DURATION_HR = 1
MAX_DRIVE_WINDOW_HR = 11
MAX_DUTY_WINDOW_HR = 14
BREAK_AFTER_DRIVE_HR = 8
BREAK_DURATION_HR = 0.5
CYCLE_LIMIT_HR = 70
CYCLE_DAYS = 8
REQUIRED_OFF_DUTY_HR = 10


class HOSCalculator:
    def __init__(self, total_distance_miles, current_cycle_used_hr=0):
        self.total_distance = total_distance_miles
        self.cycle_used = current_cycle_used_hr
        self.events = []  # list of dicts: {type, start_hr, end_hr, label}
        self.clock = 0.0  # cumulative hours since trip start

    def add_event(self, event_type, duration_hr, label="", mile_marker=None):
        start = self.clock
        end = self.clock + duration_hr
        self.events.append({
            "type": event_type,
            "start_hr": round(start, 2),
            "end_hr": round(end, 2),
            "label": label,
            "mile_marker": round(mile_marker, 1) if mile_marker is not None else None
        })
        self.clock = end
        if event_type in ("driving", "on_duty"):
            self.cycle_used += duration_hr

    def calculate(self):
        remaining_distance = self.total_distance

        # Pickup
        self.add_event("on_duty", PICKUP_DURATION_HR, "Pickup")

        drive_since_break = 0.0
        drive_in_window = 0.0
        duty_window_start = self.clock
        miles_since_fuel = 0.0

        while remaining_distance > 0:
            # Check if 70-hr cycle limit reached -> mandatory 34hr restart
            if self.cycle_used >= CYCLE_LIMIT_HR:
                self.add_event("off_duty", 34, "34-hour restart (cycle limit reached)")
                self.cycle_used = 0
                drive_since_break = 0.0
                drive_in_window = 0.0
                duty_window_start = self.clock
                continue

            # Check 14-hr duty window
            if self.clock - duty_window_start >= MAX_DUTY_WINDOW_HR:
                miles_covered = self.total_distance - remaining_distance
                self.add_event("off_duty", REQUIRED_OFF_DUTY_HR, "Required rest (14hr window reached)", mile_marker=miles_covered)
                drive_since_break = 0.0
                drive_in_window = 0.0
                duty_window_start = self.clock
                continue

            # Check 30-min break after 8hr cumulative driving
            if drive_since_break >= BREAK_AFTER_DRIVE_HR:
                miles_covered = self.total_distance - remaining_distance
                self.add_event("off_duty", BREAK_DURATION_HR, "30-min break", mile_marker=miles_covered)
                drive_since_break = 0.0
                continue

            # Determine how much we can drive right now
            hr_left_in_11 = MAX_DRIVE_WINDOW_HR - drive_in_window
            hr_left_in_14 = MAX_DUTY_WINDOW_HR - (self.clock - duty_window_start)
            hr_left_before_break = BREAK_AFTER_DRIVE_HR - drive_since_break
            hr_left_in_cycle = CYCLE_LIMIT_HR - self.cycle_used

            drive_chunk = min(hr_left_in_11, hr_left_in_14, hr_left_before_break, hr_left_in_cycle)

            # Also cap by remaining distance and next fuel stop
            miles_possible = drive_chunk * AVG_SPEED_MPH
            miles_to_fuel = FUEL_INTERVAL_MILES - miles_since_fuel
            miles_this_chunk = min(miles_possible, remaining_distance, miles_to_fuel)
            hours_this_chunk = miles_this_chunk / AVG_SPEED_MPH

            if hours_this_chunk <= 0:
                # Safety fallback to avoid infinite loop
                miles_covered = self.total_distance - remaining_distance
                self.add_event("off_duty", REQUIRED_OFF_DUTY_HR, "Required rest", mile_marker=miles_covered)
                drive_since_break = 0.0
                drive_in_window = 0.0
                duty_window_start = self.clock
                continue

            self.add_event("driving", hours_this_chunk, "Driving")
            drive_since_break += hours_this_chunk
            drive_in_window += hours_this_chunk
            remaining_distance -= miles_this_chunk
            miles_since_fuel += miles_this_chunk

            if miles_since_fuel >= FUEL_INTERVAL_MILES and remaining_distance > 0:
                miles_covered = self.total_distance - remaining_distance
                self.add_event("on_duty", FUEL_DURATION_HR, "Fuel stop", mile_marker=miles_covered)
                miles_since_fuel = 0.0

        # Dropoff
        self.add_event("on_duty", DROPOFF_DURATION_HR, "Dropoff")

        # Fill remainder of the current 24-hour day as off duty,
        # so the daily log always totals 24 hours per FMCSA requirements
        hours_into_day = self.clock % 24
        if hours_into_day > 0:
            remaining_today = 24 - hours_into_day
            self.add_event("off_duty", remaining_today, "Off duty (end of trip)")

        return self.events

    def split_into_days(self):
        """Convert continuous events into per-day (24hr) log sheets."""
        days = []
        current_day = {"day_number": 1, "segments": []}
        day_start_hr = 0.0

        for event in self.events:
            start = event["start_hr"]
            end = event["end_hr"]

            while start < end:
                day_index = int(start // 24)
                day_boundary = (day_index + 1) * 24
                seg_end = min(end, day_boundary)

                while len(days) <= day_index:
                    days.append({"day_number": len(days) + 1, "segments": []})

                days[day_index]["segments"].append({
                    "type": event["type"],
                    "start_hr": round(start - day_index * 24, 2),
                    "end_hr": round(seg_end - day_index * 24, 2),
                    "label": event["label"]
                })

                start = seg_end

        return days