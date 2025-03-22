document.addEventListener('DOMContentLoaded', function() {
    // Get HTML elements - Controls
    const rotationSpeedInput = document.getElementById('rotation-speed');
    const magneticFieldInput = document.getElementById('magnetic-field');
    const coilTurnsInput = document.getElementById('coil-turns');
    const coilAreaInput = document.getElementById('coil-area');
    const loadResistanceInput = document.getElementById('load-resistance');
    const animationSpeedInput = document.getElementById('animation-speed');
    const showFieldLinesCheckbox = document.getElementById('show-field-lines');
    const showCurrentFlowCheckbox = document.getElementById('show-current-flow');
    const showFluxVectorsCheckbox = document.getElementById('show-flux-vectors');
    
    // Value display spans
    const speedValueSpan = document.getElementById('speed-value');
    const fieldValueSpan = document.getElementById('field-value');
    const turnsValueSpan = document.getElementById('turns-value');
    const areaValueSpan = document.getElementById('area-value');
    const resistanceValueSpan = document.getElementById('resistance-value');
    const animationSpeedValueSpan = document.getElementById('animation-speed-value');
    
    // Control buttons
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Output displays
    const voltageValue = document.getElementById('voltage-value');
    const currentValue = document.getElementById('current-value');
    const frequencyValue = document.getElementById('frequency-value');
    const powerValue = document.getElementById('power-value');
    
    // Get canvas elements
    const generatorCanvas = document.getElementById('generator-canvas');
    const generatorCtx = generatorCanvas.getContext('2d');
    const voltageCanvas = document.getElementById('voltage-canvas');
    const voltageCtx = voltageCanvas.getContext('2d');
    const currentCanvas = document.getElementById('current-canvas');
    const currentCtx = currentCanvas.getContext('2d');
    const powerCanvas = document.getElementById('power-canvas');
    const powerCtx = powerCanvas.getContext('2d');
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Output display tabs
    const outputTabButtons = document.querySelectorAll('.output-tab-btn');
    const outputDisplays = document.querySelectorAll('.output-display');
    
    // Simulation variables
    let animationId = null;
    let angle = 0;
    let rotationSpeed = 400; // RPM
    let magneticField = 1.0; // Tesla
    let coilTurns = 50;
    let coilArea = 100; // cm^2
    let loadResistance = 100; // Ohms
    let animationSpeed = 0.1;
    let isRunning = false;
    let time = 0;
    
    // Data points for graphs
    let voltageDataPoints = [];
    let currentDataPoints = [];
    let powerDataPoints = [];
    const maxDataPoints = 150;
    
    // Constants
    const CM2_TO_M2 = 0.0001; // Convert cm^2 to m^2
    
    // Initialize
    drawGenerator();
    drawVoltageWave();
    drawCurrentWave();
    drawPowerWave();
    
    // Event listeners for tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
    
    // Event listeners for output display tabs
    outputTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-output-tab');
            
            // Update active button
            outputTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show active content
            outputDisplays.forEach(display => display.classList.remove('active'));
            document.getElementById(tabId + '-display').classList.add('active');
        });
    });
    
    // Event listeners for controls
    rotationSpeedInput.addEventListener('input', function() {
        rotationSpeed = parseInt(this.value);
        speedValueSpan.textContent = rotationSpeed;
        if (isRunning) {
            updateFrequency();
        }
    });
    
    magneticFieldInput.addEventListener('input', function() {
        magneticField = parseFloat(this.value);
        fieldValueSpan.textContent = magneticField.toFixed(1);
    });
    
    coilTurnsInput.addEventListener('input', function() {
        coilTurns = parseInt(this.value);
        turnsValueSpan.textContent = coilTurns;
    });
    
    coilAreaInput.addEventListener('input', function() {
        coilArea = parseInt(this.value);
        areaValueSpan.textContent = coilArea;
    });
    
    loadResistanceInput.addEventListener('input', function() {
        loadResistance = parseInt(this.value);
        resistanceValueSpan.textContent = loadResistance;
    });
    
    animationSpeedInput.addEventListener('input', function() {
        animationSpeed = parseFloat(this.value);
        animationSpeedValueSpan.textContent = animationSpeed.toFixed(1);
    });
    
    startBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = true;
            startSimulation();
        }
    });
    
    stopBtn.addEventListener('click', function() {
        if (isRunning) {
            isRunning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            stopSimulation();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        resetSimulation();
    });
    
    // Functions
    function startSimulation() {
        updateFrequency();
        animationId = requestAnimationFrame(animateSimulation);
    }
    
    function stopSimulation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    function resetSimulation() {
        angle = 0;
        time = 0;
        voltageDataPoints = [];
        currentDataPoints = [];
        powerDataPoints = [];
        drawGenerator();
        drawVoltageWave();
        drawCurrentWave();
        drawPowerWave();
        voltageValue.textContent = '0.00';
        currentValue.textContent = '0.00';
        powerValue.textContent = '0.00';
    }
    
    function updateFrequency() {
        // Calculate frequency from RPM
        const frequency = rotationSpeed / 60; // Hz (1 rotation per second = 1 Hz)
        frequencyValue.textContent = frequency.toFixed(2);
    }
    
    function animateSimulation() {
        // Calculate time step based on animation speed
        const timeStep = 0.016 * animationSpeed; // Approximately 16ms * speed factor
        time += timeStep;
        
        // Update angle based on rotation speed and animation speed
        // rotationSpeed is in RPM, convert to radians per animation frame
        const angularVelocity = (rotationSpeed / 60) * 2 * Math.PI; // rad/sec
        angle += angularVelocity * timeStep;
        
        if (angle > Math.PI * 2) {
            angle -= Math.PI * 2;
        }
        
        // Calculate voltage, current and power
        const voltage = calculateVoltage(angle);
        const current = calculateCurrent(voltage);
        const power = calculatePower(voltage, current);
        
        // Add data points for the graphs
        addDataPoint(voltage, current, power);
        
        // Update display
        drawGenerator();
        drawVoltageWave();
        drawCurrentWave();
        drawPowerWave();
        updateMeasurements(voltage, current, power);
        
        // Continue animation
        if (isRunning) {
            animationId = requestAnimationFrame(animateSimulation);
        }
    }
    
    function calculateVoltage(angle) {
        // Using Faraday's law: EMF = -N * d(phi)/dt
        // For a rotating coil: EMF = -N * B * A * omega * sin(omega * t)
        // Where N is number of turns, B is magnetic field, A is area,
        // omega is angular velocity
        
        const angularVelocity = (rotationSpeed / 60) * 2 * Math.PI; // rad/sec
        const areaInSquareMeters = coilArea * CM2_TO_M2; // Convert cm^2 to m^2
        
        // Peak voltage formula: N * B * A * omega
        const peakVoltage = coilTurns * magneticField * areaInSquareMeters * angularVelocity;
        
        // Instantaneous voltage at the current angle
        return peakVoltage * Math.sin(angle);
    }
    
    function calculateCurrent(voltage) {
        // Using Ohm's law: I = V/R
        return voltage / loadResistance;
    }
    
    function calculatePower(voltage, current) {
        // Power = V * I
        return voltage * current;
    }
    
    function addDataPoint(voltage, current, power) {
        voltageDataPoints.push(voltage);
        currentDataPoints.push(current);
        powerDataPoints.push(power);
        
        if (voltageDataPoints.length > maxDataPoints) {
            voltageDataPoints.shift();
            currentDataPoints.shift();
            powerDataPoints.shift();
        }
    }
    
    function updateMeasurements(voltage, current, power) {
        // Display RMS values for AC measurements
        const rmsVoltage = Math.abs(voltage) / Math.sqrt(2);
        const rmsCurrent = Math.abs(current) / Math.sqrt(2);
        const averagePower = Math.abs(power) / 2; // Average power for a sinusoidal wave
        
        voltageValue.textContent = rmsVoltage.toFixed(2);
        currentValue.textContent = rmsCurrent.toFixed(3);
        powerValue.textContent = averagePower.toFixed(2);
    }
    
    function drawGenerator() {
        // Clear canvas
        generatorCtx.clearRect(0, 0, generatorCanvas.width, generatorCanvas.height);
        
        const centerX = generatorCanvas.width / 2;
        const centerY = generatorCanvas.height / 2;
        const radius = 120;
        
        // Draw title and angle indicator
        generatorCtx.fillStyle = '#333';
        generatorCtx.font = '12px Arial';
        generatorCtx.textAlign = 'left';
        generatorCtx.textBaseline = 'top';
        generatorCtx.fillText(`Angle: ${(angle * 180 / Math.PI).toFixed(1)}°`, 10, 10);
        
        // Draw magnetic field (N-S poles)
        drawMagneticField(centerX, centerY, radius);
        
        // Draw rotor and coil
        drawRotor(centerX, centerY, radius, angle);
        
        // Draw slip rings and brushes
        drawSlipRingsAndBrushes(centerX, centerY, radius);
        
        // Draw output wires
        drawOutputWires(centerX, centerY, radius);
        
        // Draw flux vectors if enabled
        if (showFluxVectorsCheckbox.checked) {
            drawFluxVectors(centerX, centerY, radius, angle);
        }
    }
    
    function drawMagneticField(centerX, centerY, radius) {
        // Draw N pole (top)
        generatorCtx.fillStyle = '#e74c3c';
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY - radius - 40, 35, 0, Math.PI * 2);
        generatorCtx.fill();
        generatorCtx.fillStyle = 'white';
        generatorCtx.font = '24px Arial';
        generatorCtx.textAlign = 'center';
        generatorCtx.textBaseline = 'middle';
        generatorCtx.fillText('N', centerX, centerY - radius - 40);
        
        // Draw S pole (bottom)
        generatorCtx.fillStyle = '#3498db';
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY + radius + 40, 35, 0, Math.PI * 2);
        generatorCtx.fill();
        generatorCtx.fillStyle = 'white';
        generatorCtx.fillText('S', centerX, centerY + radius + 40);
        
        // Draw magnetic field strength indicator
        generatorCtx.fillStyle = '#333';
        generatorCtx.font = '12px Arial';
        generatorCtx.textAlign = 'center';
        generatorCtx.fillText(`${magneticField.toFixed(1)} Tesla`, centerX, centerY - radius - 70);
        
        // Draw magnetic field lines if enabled
        if (showFieldLinesCheckbox.checked) {
            generatorCtx.strokeStyle = '#aaa';
            generatorCtx.setLineDash([5, 3]);
            
            const fieldStrength = magneticField; // Use field strength for visualization
            const lineCount = Math.min(Math.ceil(fieldStrength * 6), 12); // Scale number of lines with field strength
            
            for (let i = -Math.floor(lineCount/2); i <= Math.floor(lineCount/2); i++) {
                if (i === 0) continue; // Skip center line for clarity
                
                const xOffset = i * (radius / (lineCount/2)) * 0.6;
                
                generatorCtx.beginPath();
                generatorCtx.moveTo(centerX + xOffset, centerY - radius - 40 + 35);
                
                // Adjust curve based on field strength
                const controlPointOffset = 50 * fieldStrength;
                generatorCtx.bezierCurveTo(
                    centerX + xOffset - controlPointOffset, centerY - radius/2,
                    centerX + xOffset + controlPointOffset, centerY + radius/2,
                    centerX + xOffset, centerY + radius + 40 - 35
                );
                
                generatorCtx.stroke();
            }
            
            generatorCtx.setLineDash([]);
        }
    }
    
    function drawRotor(centerX, centerY, radius, angle) {
        // Draw stator (fixed outer part)
        generatorCtx.strokeStyle = '#777';
        generatorCtx.lineWidth = 2;
        generatorCtx.setLineDash([4, 2]);
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
        generatorCtx.stroke();
        generatorCtx.setLineDash([]);
        
        // Draw rotor circle
        generatorCtx.strokeStyle = '#333';
        generatorCtx.lineWidth = 2;
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        generatorCtx.stroke();
        
        // Draw rotating shaft
        generatorCtx.fillStyle = '#555';
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        generatorCtx.fill();
        
        // Draw coil
        const coilWidth = Math.min(80, radius * 0.6);
        const coilHeight = Math.min(200, radius * 1.5);
        
        generatorCtx.save();
        generatorCtx.translate(centerX, centerY);
        generatorCtx.rotate(angle);
        
        // Draw coil turns indicator
        const turnWidth = 6;
        const turnSpacing = 2;
        const maxVisibleTurns = 5;
        const visibleTurns = Math.min(coilTurns, maxVisibleTurns);
        
        // Coil sides
        generatorCtx.strokeStyle = '#e67e22';
        generatorCtx.lineWidth = 2;
        
        // Left side turns
        for (let i = 0; i < visibleTurns; i++) {
            generatorCtx.beginPath();
            const xOffset = -coilWidth/2 - (i * (turnWidth + turnSpacing));
            generatorCtx.rect(xOffset, -coilHeight/2, turnWidth, coilHeight);
            generatorCtx.stroke();
            generatorCtx.fillStyle = 'rgba(230, 126, 34, 0.3)';
            generatorCtx.fill();
        }
        
        // If more turns than visible, draw indicator
        if (coilTurns > maxVisibleTurns) {
            generatorCtx.fillStyle = '#333';
            generatorCtx.font = '12px Arial';
            generatorCtx.textAlign = 'center';
            generatorCtx.fillText(`+${coilTurns - maxVisibleTurns}`, -coilWidth/2 - maxVisibleTurns * (turnWidth + turnSpacing) - 15, 0);
        }
        
        // Right side turns
        for (let i = 0; i < visibleTurns; i++) {
            generatorCtx.beginPath();
            const xOffset = coilWidth/2 + (i * (turnWidth + turnSpacing));
            generatorCtx.rect(xOffset, -coilHeight/2, turnWidth, coilHeight);
            generatorCtx.stroke();
            generatorCtx.fillStyle = 'rgba(230, 126, 34, 0.3)';
            generatorCtx.fill();
        }
        
        // If more turns than visible, draw indicator
        if (coilTurns > maxVisibleTurns) {
            generatorCtx.fillStyle = '#333';
            generatorCtx.font = '12px Arial';
            generatorCtx.textAlign = 'center';
            generatorCtx.fillText(`+${coilTurns - maxVisibleTurns}`, coilWidth/2 + maxVisibleTurns * (turnWidth + turnSpacing) + 15, 0);
        }
        
        // Top and bottom connectors
        generatorCtx.lineWidth = 3;
        generatorCtx.beginPath();
        generatorCtx.moveTo(-coilWidth/2, -coilHeight/2);
        generatorCtx.lineTo(coilWidth/2, -coilHeight/2);
        generatorCtx.stroke();
        
        generatorCtx.beginPath();
        generatorCtx.moveTo(-coilWidth/2, coilHeight/2);
        generatorCtx.lineTo(coilWidth/2, coilHeight/2);
        generatorCtx.stroke();
        
        // Draw coil area indicator
        generatorCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        generatorCtx.fillRect(-coilWidth/2, -coilHeight/2, coilWidth, coilHeight);
        generatorCtx.fillStyle = '#333';
        generatorCtx.font = '12px Arial';
        generatorCtx.textAlign = 'center';
        generatorCtx.fillText(`${coilArea} cm²`, 0, 0);
        
        // Draw direction arrow inside the coil if running
        if (isRunning) {
            const voltage = calculateVoltage(angle);
            if (Math.abs(voltage) > 0.5) {
                const arrowDirection = voltage > 0 ? 1 : -1;
                
                generatorCtx.strokeStyle = '#000';
                generatorCtx.lineWidth = 2;
                generatorCtx.beginPath();
                generatorCtx.moveTo(0, -20 * arrowDirection);
                generatorCtx.lineTo(0, 20 * arrowDirection);
                generatorCtx.stroke();
                
                // Arrow head
                generatorCtx.beginPath();
                generatorCtx.moveTo(-5, 10 * arrowDirection);
                generatorCtx.lineTo(0, 20 * arrowDirection);
                generatorCtx.lineTo(5, 10 * arrowDirection);
                generatorCtx.stroke();
            }
        }
        
        generatorCtx.restore();
    }
    
    function drawSlipRingsAndBrushes(centerX, centerY, radius) {
        // Draw slip rings
        generatorCtx.strokeStyle = '#777';
        generatorCtx.lineWidth = 4;
        
        // Top slip ring
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY, radius + 20, Math.PI * 0.2, Math.PI * 0.8);
        generatorCtx.stroke();
        
        // Bottom slip ring
        generatorCtx.beginPath();
        generatorCtx.arc(centerX, centerY, radius + 20, Math.PI * 1.2, Math.PI * 1.8);
        generatorCtx.stroke();
        
        // Draw brushes
        generatorCtx.fillStyle = '#333';
        
        // Top brush
        generatorCtx.beginPath();
        generatorCtx.rect(centerX - 5, centerY - radius - 30, 10, 10);
        generatorCtx.fill();
        
        // Bottom brush
        generatorCtx.beginPath();
        generatorCtx.rect(centerX - 5, centerY + radius + 20, 10, 10);
        generatorCtx.fill();
    }
    
    function drawOutputWires(centerX, centerY, radius) {
        generatorCtx.strokeStyle = '#333';
        generatorCtx.lineWidth = 2;
        
        // Top wire
        generatorCtx.beginPath();
        generatorCtx.moveTo(centerX, centerY - radius - 30 + 10);
        generatorCtx.lineTo(centerX, centerY - radius - 50);
        generatorCtx.lineTo(centerX + radius + 80, centerY - radius - 50);
        generatorCtx.stroke();
        
        // Bottom wire
        generatorCtx.beginPath();
        generatorCtx.moveTo(centerX, centerY + radius + 20 + 10);
        generatorCtx.lineTo(centerX, centerY + radius + 50);
        generatorCtx.lineTo(centerX + radius + 80, centerY + radius + 50);
        generatorCtx.stroke();
        
        // Draw load resistor
        drawResistor(centerX + radius + 80, centerY - radius - 50, centerX + radius + 80, centerY + radius + 50);
        
        // Draw current flow if enabled
        if (showCurrentFlowCheckbox.checked && isRunning) {
            const voltage = calculateVoltage(angle);
            const current = calculateCurrent(voltage);
            
            if (Math.abs(current) > 0.001) {
                const particleSpeed = Math.min(Math.abs(current) * 2, 3);
                const direction = current > 0 ? 1 : -1;
                
                generatorCtx.fillStyle = '#3498db';
                
                // Draw current flow particles
                for (let i = 0; i < 10; i++) {
                    const t = (Date.now() / (100 / particleSpeed) + i * 10) % 100;
                    
                    // Determine direction based on current
                    if (direction > 0) {
                        // Current flowing clockwise
                        
                        // Top wire particles (left to right)
                        const topX = centerX + t * (radius + 80) / 100;
                        if (topX >= centerX && topX <= centerX + radius + 80) {
                            generatorCtx.beginPath();
                            generatorCtx.arc(topX, centerY - radius - 50, 3, 0, Math.PI * 2);
                            generatorCtx.fill();
                        }
                        
                        // Bottom wire particles (right to left)
                        const bottomX = centerX + radius + 80 - t * (radius + 80) / 100;
                        if (bottomX >= centerX && bottomX <= centerX + radius + 80) {
                            generatorCtx.beginPath();
                            generatorCtx.arc(bottomX, centerY + radius + 50, 3, 0, Math.PI * 2);
                            generatorCtx.fill();
                        }
                    } else {
                        // Current flowing counter-clockwise
                        
                        // Top wire particles (right to left)
                        const topX = centerX + radius + 80 - t * (radius + 80) / 100;
                        if (topX >= centerX && topX <= centerX + radius + 80) {
                            generatorCtx.beginPath();
                            generatorCtx.arc(topX, centerY - radius - 50, 3, 0, Math.PI * 2);
                            generatorCtx.fill();
                        }
                        
                        // Bottom wire particles (left to right)
                        const bottomX = centerX + t * (radius + 80) / 100;
                        if (bottomX >= centerX && bottomX <= centerX + radius + 80) {
                            generatorCtx.beginPath();
                            generatorCtx.arc(bottomX, centerY + radius + 50, 3, 0, Math.PI * 2);
                            generatorCtx.fill();
                        }
                    }
                }
            }
        }
        
        // Draw load resistance value
        generatorCtx.fillStyle = '#333';
        generatorCtx.font = '12px Arial';
        generatorCtx.textAlign = 'right';
        generatorCtx.textBaseline = 'middle';
        generatorCtx.fillText(`${loadResistance} Ω`, centerX + radius + 120, centerY);
    }
    
    function drawResistor(x1, y1, x2, y2) {
        const centerY = (y1 + y2) / 2;
        const resistorHeight = 40;
        const zigzagWidth = 8;
        const zigzagCount = 6;
        
        generatorCtx.strokeStyle = '#333';
        generatorCtx.lineWidth = 2;
        
        // Draw line to resistor
        generatorCtx.beginPath();
        generatorCtx.moveTo(x1, y1);
        generatorCtx.lineTo(x1, centerY - resistorHeight / 2);
        generatorCtx.stroke();
        
        // Draw resistor zigzag
        generatorCtx.beginPath();
        generatorCtx.moveTo(x1, centerY - resistorHeight / 2);
        
        for (let i = 0; i < zigzagCount; i++) {
            const yOffset = i % 2 === 0 ? -zigzagWidth : zigzagWidth;
            generatorCtx.lineTo(x1 + (i + 1) * zigzagWidth, centerY - resistorHeight / 2 + yOffset);
        }
        
        generatorCtx.lineTo(x1, centerY + resistorHeight / 2);
        generatorCtx.stroke();
        
        // Draw line from resistor
        generatorCtx.beginPath();
        generatorCtx.moveTo(x1, centerY + resistorHeight / 2);
        generatorCtx.lineTo(x2, y2);
        generatorCtx.stroke();
    }
    
    function drawFluxVectors(centerX, centerY, radius, angle) {
        const coilWidth = Math.min(80, radius * 0.6);
        const coilHeight = Math.min(200, radius * 1.5);
        
        generatorCtx.save();
        generatorCtx.translate(centerX, centerY);
        generatorCtx.rotate(angle);
        
        // Draw the magnetic field vector (always points from N to S)
        generatorCtx.strokeStyle = '#e74c3c';
        generatorCtx.lineWidth = 2;
        generatorCtx.setLineDash([]);
        
        // Calculate vector magnitude based on magnetic field strength
        const vectorLength = 40 * magneticField;
        
        // Draw the field vector (vertical, pointing down)
        generatorCtx.beginPath();
        generatorCtx.moveTo(0, -vectorLength / 2);
        generatorCtx.lineTo(0, vectorLength / 2);
        generatorCtx.stroke();
        
        // Draw arrowhead
        generatorCtx.beginPath();
        generatorCtx.moveTo(-5, vectorLength / 2 - 10);
        generatorCtx.lineTo(0, vectorLength / 2);
        generatorCtx.lineTo(5, vectorLength / 2 - 10);
        generatorCtx.stroke();
        
        // Draw vector label
        generatorCtx.fillStyle = '#e74c3c';
        generatorCtx.font = '14px Arial';
        generatorCtx.textAlign = 'left';
        generatorCtx.textBaseline = 'middle';
        generatorCtx.fillText('B', 10, 0);
        
        // Draw area vector (perpendicular to coil)
        generatorCtx.strokeStyle = '#3498db';
        
        // Calculate magnitude based on coil area
        const areaVectorLength = 30 * Math.sqrt(coilArea / 100);
        
        // Draw the area vector (horizontal)
        generatorCtx.beginPath();
        generatorCtx.moveTo(-areaVectorLength / 2, 0);
        generatorCtx.lineTo(areaVectorLength / 2, 0);
        generatorCtx.stroke();
        
        // Draw arrowhead
        generatorCtx.beginPath();
        generatorCtx.moveTo(areaVectorLength / 2 - 10, -5);
        generatorCtx.lineTo(areaVectorLength / 2, 0);
        generatorCtx.lineTo(areaVectorLength / 2 - 10, 5);
        generatorCtx.stroke();
        
        // Draw vector label
        generatorCtx.fillStyle = '#3498db';
        generatorCtx.fillText('A', 0, -15);
        
        // Draw angle indicator between vectors
        const angleRadius = 25;
        const fluxAngle = Math.PI / 2; // 90 degrees between B and A
        
        generatorCtx.strokeStyle = '#2ecc71';
        generatorCtx.beginPath();
        generatorCtx.arc(0, 0, angleRadius, -Math.PI/2, 0, false);
        generatorCtx.stroke();
        
        // Draw angle label
        generatorCtx.fillStyle = '#2ecc71';
        generatorCtx.fillText('θ', angleRadius * 0.7, -angleRadius * 0.3);
        
        generatorCtx.restore();
    }
    
    function drawVoltageWave() {
        drawWave(voltageCtx, voltageCanvas, voltageDataPoints, '#e74c3c', 'Voltage (V)', 'Time', true);
    }
    
    function drawCurrentWave() {
        drawWave(currentCtx, currentCanvas, currentDataPoints, '#3498db', 'Current (A)', 'Time', true);
    }
    
    function drawPowerWave() {
        drawWave(powerCtx, powerCanvas, powerDataPoints, '#2ecc71', 'Power (W)', 'Time', false);
    }
    
    function drawWave(ctx, canvas, dataPoints, color, yLabel, xLabel, drawZeroLine) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up dimensions
        const padding = {top: 20, right: 20, bottom: 20, left: 40};
        const graphWidth = canvas.width - padding.left - padding.right;
        const graphHeight = canvas.height - padding.top - padding.bottom;
        
        // Find max value for scaling
        let maxValue = 0.1; // Minimum scale to avoid division by zero
        if (dataPoints.length > 0) {
            maxValue = Math.max(maxValue, ...dataPoints.map(v => Math.abs(v)));
        }
        
        // Draw axes
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // X-axis (time)
        const yCenter = padding.top + graphHeight / 2;
        ctx.moveTo(padding.left, yCenter);
        ctx.lineTo(padding.left + graphWidth, yCenter);
        
        // Y-axis
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + graphHeight);
        
        // Grid lines
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const yPos = padding.top + (i * graphHeight / 4);
            ctx.moveTo(padding.left, yPos);
            ctx.lineTo(padding.left + graphWidth, yPos);
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const xPos = padding.left + (i * graphWidth / 10);
            ctx.moveTo(xPos, padding.top);
            ctx.lineTo(xPos, padding.top + graphHeight);
        }
        
        ctx.stroke();
        
        // Draw zero line if requested (for AC waveforms)
        if (drawZeroLine) {
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(padding.left, yCenter);
            ctx.lineTo(padding.left + graphWidth, yCenter);
            ctx.stroke();
        }
        
        // Draw Y-axis labels
        ctx.fillStyle = '#777';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        // Positive maximum
        ctx.fillText(`+${maxValue.toFixed(1)}`, padding.left - 5, padding.top);
        
        // If we need a zero line (AC waveforms)
        if (drawZeroLine) {
            // Zero
            ctx.fillText('0', padding.left - 5, yCenter);
            
            // Negative maximum
            ctx.fillText(`-${maxValue.toFixed(1)}`, padding.left - 5, padding.top + graphHeight);
        } else {
            // Zero at bottom for non-AC waveforms (like power)
            ctx.fillText('0', padding.left - 5, padding.top + graphHeight);
        }
        
        // Draw axes labels
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        
        // Y-axis label
        ctx.save();
        ctx.translate(10, padding.top + graphHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
        
        // X-axis label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xLabel, padding.left + graphWidth / 2, padding.top + graphHeight + 5);
        
        // Draw the waveform
        if (dataPoints.length > 1) {
            const pointWidth = graphWidth / maxDataPoints;
            const scale = drawZeroLine ? 
                           graphHeight / (2 * maxValue) : // For AC waveforms
                           graphHeight / maxValue;        // For non-AC waveforms
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < dataPoints.length; i++) {
                const x = padding.left + i * pointWidth;
                let y;
                
                if (drawZeroLine) {
                    // For AC waveforms, center at yCenter
                    y = yCenter - dataPoints[i] * scale;
                } else {
                    // For non-AC waveforms (like power), bottom at graph bottom
                    y = padding.top + graphHeight - dataPoints[i] * scale;
                }
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Draw a slightly transparent fill under the line for power graph
            if (!drawZeroLine && dataPoints.length > 0) {
                ctx.lineTo(padding.left + (dataPoints.length - 1) * pointWidth, padding.top + graphHeight);
                ctx.lineTo(padding.left, padding.top + graphHeight);
                ctx.closePath();
                ctx.fillStyle = `${color}33`; // Add 33 for 20% opacity
                ctx.fill();
            }
        }
    }
}); 
