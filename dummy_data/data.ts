const StationData1 = {
    "name": "New Delhi Railway Station",
    "code": "NDLS",
    "city": "New Delhi",
    "state": "Delhi"
}

const StationData2 = {
    "name": "Chhatrapati Shivaji Maharaj Terminus",
    "code": "CSMT",
    "city": "Mumbai",
    "state": "Maharashtra"
}

const StationData3 = {
    "name": "Howrah Junction",
    "code": "HWH",
    "city": "Kolkata",
    "state": "West Bengal"
}

const TrainData = {
    "trainNumber": "11056",
    "trainName": "Godan Express",
    "coachName": "AC",
    "seats": [
        {
            "seatNumber": 1,
            "seatType": "LOWER",
            "price": 500,
        },
        {
            "seatNumber": 2,
            "seatType": "MIDDLE",
            "price": 1000,
        },
        {
            "seatNumber": 3,
            "seatType": "UPPER",
            "price": 1500,
        },
        {
            "seatNumber": 4,
            "seatType": "SIDE_LOWER",
            "price": 2000,
        },
        {
            "seatNumber": 5,
            "seatType": "SIDE_UPPER",
            "price": 2500,
        }
    ]
}       
    
const RouteData = {
    "trainId": "fd59416e-e831-4038-be36-9611b70bec47",
    "stations": [
        {
            "stationId": "4056936f-c166-4cc6-a45d-67406675daf4",
            "sequenceNumber": 1,
            "arrivalTime": "10:00",
            "departureTime": "10:15",
            "distanceFromOrigin": 0
        },
        {
            "stationId": "4666cec9-4745-4bf3-859d-36af47151d44",
            "sequenceNumber": 2,
            "arrivalTime": "12:00",
            "departureTime": "12:15",
            "distanceFromOrigin": 200
        },
        {
            "stationId": "9808dcbe-2a52-4109-a728-0b421ce0bdd2",
            "sequenceNumber": 3,
            "arrivalTime": "14:00",
            "departureTime": "14:15",
            "distanceFromOrigin": 400
        }
    ]
}