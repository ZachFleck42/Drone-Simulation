import { useState, useEffect } from 'react';
import { Simulation } from '../types/Simulation';

function GridDisplay({ data }: { data: Simulation }) {
	const [currentGridIndex, setCurrentFrameIndex] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const terrainGrids = data.map((item) => item.environment.terrain.grid);
	const droneGrids = data.map((item) => item.drone.data.grid);

	const targetPosition: { x: number; y: number } = {
		x: data[currentGridIndex].environment.target.x,
		y: data[currentGridIndex].environment.target.y,
	};

	const dronePosition: { x: number; y: number } = {
		x: data[currentGridIndex].drone.x,
		y: data[currentGridIndex].drone.y,
	};

	const currentGrid = terrainGrids[currentGridIndex];

	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isPlaying) {
			intervalId = setInterval(() => {
				setCurrentFrameIndex((prevIndex) => {
					const nextIndex = prevIndex + 1;
					if (nextIndex >= terrainGrids.length) {
						setIsPlaying(false);
						return terrainGrids.length - 1;
					}
					return nextIndex;
				});
			}, 500);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isPlaying, terrainGrids.length]);

	const togglePlayPause = () => {
		if (currentGridIndex === terrainGrids.length - 1) {
			setCurrentFrameIndex(0);
		}
		setIsPlaying((prevState) => !prevState);
	};

	return (
		<div className="grid-display">
			<div className="grid-container">
				{currentGrid.map((row, rowIndex) => (
					<div className="grid-row" key={rowIndex}>
						{row.map((cell, colIndex) => (
							<div
								className={`grid-cell${cell.hostile ? ' hostile' : ''}${
									targetPosition.x === rowIndex && targetPosition.y === colIndex
										? ' target'
										: ''
								}`}
								key={colIndex}>
								{targetPosition.x === rowIndex && targetPosition.y === colIndex
									? 'T'
									: ''}
								{dronePosition.x === rowIndex && dronePosition.y === colIndex
									? 'D'
									: ''}
							</div>
						))}
					</div>
				))}
			</div>
			<div className="frame-buttons">
				<button
					onClick={() => setCurrentFrameIndex(0)}
					disabled={isPlaying || currentGridIndex === 0}>
					&lt; &lt;
				</button>
				<button
					onClick={() => setCurrentFrameIndex((prevIndex) => prevIndex - 1)}
					disabled={isPlaying || currentGridIndex === 0}>
					&lt;
				</button>
				<span>
					{currentGridIndex} / {terrainGrids.length - 1}
				</span>
				<button
					onClick={() => setCurrentFrameIndex((prevIndex) => prevIndex + 1)}
					disabled={isPlaying || currentGridIndex === terrainGrids.length - 1}>
					&gt;
				</button>
				<button
					onClick={() => setCurrentFrameIndex(terrainGrids.length - 1)}
					disabled={isPlaying || currentGridIndex === terrainGrids.length - 1}>
					&gt; &gt;
				</button>
				<button onClick={togglePlayPause}>
					{currentGridIndex === terrainGrids.length - 1
						? 'Replay'
						: isPlaying
						? 'Pause'
						: 'Play'}
				</button>
			</div>
		</div>
	);
}

export default GridDisplay;
