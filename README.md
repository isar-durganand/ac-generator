# AC Generator Simulator

An interactive web application that simulates the working principle of an AC generator using Python Flask and HTML5 Canvas.

## Features

- Interactive visualization of an AC generator's working principle
- Adjustable rotation speed and magnetic field strength
- Real-time voltage output visualization
- Simulated frequency calculation
- Detailed explanation of AC generator components and operation

## Requirements

- Python 3.6 or higher
- Flask and its dependencies (specified in requirements.txt)

## Installation

1. Clone this repository
2. Install the required dependencies:

```
pip install -r requirements.txt
```

## Running the Application

1. Run the Flask application:

```
python app.py
```

2. Open your web browser and navigate to:

```
http://127.0.0.1:5000/
```

## How it Works

The simulation demonstrates the key principles of electromagnetic induction:

1. When a coil rotates in a magnetic field, the magnetic flux through the coil changes.
2. This changing magnetic flux induces an electromotive force (EMF) in the coil.
3. The induced EMF follows a sinusoidal pattern as the coil rotates.
4. Slip rings and brushes transfer this alternating current to an external circuit.

The simulation allows you to control the rotation speed and magnetic field strength to see how these parameters affect the generated voltage and frequency.

## Technologies Used

- Python Flask for the web server
- HTML5, CSS3 for the user interface
- JavaScript with Canvas API for the interactive simulation 