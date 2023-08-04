import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, MeshProps, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Drone, Environment, Simulation } from '../types/Simulation';
import rt from '../assets/textures/skybox/arid2_rt.jpg';
import lf from '../assets/textures/skybox/arid2_lf.jpg';
import up from '../assets/textures/skybox/arid2_up.jpg';
import dn from '../assets/textures/skybox/arid2_dn.jpg';
import bk from '../assets/textures/skybox/arid2_bk.jpg';
import ft from '../assets/textures/skybox/arid2_ft.jpg';
import dirt from '../assets/textures/dirt.jpg';

const textureLoader = new THREE.TextureLoader();
const dirtTextue = textureLoader.load(dirt);

const cubrTextureLoader = new THREE.CubeTextureLoader();
const skyBoxTexture = cubrTextureLoader.load([rt, lf, up, dn, bk, ft]);

interface TerrainMeshProps extends MeshProps {
	size: number;
}

function TerrainMesh({ ...props }: TerrainMeshProps) {
	return (
		<mesh position={props.position} receiveShadow>
			<boxGeometry args={[props.size, 0.1, props.size]} />
			<meshStandardMaterial map={dirtTextue} />
		</mesh>
	);
}

interface GridProps extends MeshProps {
	environment: Environment;
	tileSize: number;
	visible: boolean;
}

function TerrainTiles({ environment, tileSize, visible }: GridProps) {
	const { terrain } = environment;

	return (
		<group name="tiles" rotation={[-Math.PI / 2, 0, 0]} visible={visible}>
			{terrain.grid.map((row, rowIndex) => {
				return row.map((tile, colIndex) => {
					const { x, y, hostile } = tile;
					if (hostile) {
						const position: [number, number, number] = [
							x * tileSize,
							y * tileSize,
							0.1,
						];
						return (
							<mesh
								receiveShadow
								scale={[tileSize, tileSize, 1]}
								key={`tile-${rowIndex}-${colIndex}`}
								position={position}>
								<boxGeometry args={[1, 1, 0.001]} />
								<meshStandardMaterial
									transparent
									opacity={0.4}
									color={'#b91c1c'}
								/>
							</mesh>
						);
					} else {
						return null;
					}
				});
			})}
		</group>
	);
}

function SkyBox() {
	const { scene } = useThree();
	scene.background = skyBoxTexture;
	return null;
}

interface VisibleTilesProps {
	tiles: [number, number][];
	visible: boolean;
}

function VisibleTiles({ visible, ...props }: VisibleTilesProps) {
	return (
		<group name="visible-tiles" visible={visible}>
			{props.tiles.map((tile, index) => {
				const [x, y] = tile;
				const tilePosition: any = [x, 0.15, -y];
				return (
					<mesh
						key={`visible-tile-${index}`}
						position={tilePosition}
						receiveShadow>
						<boxGeometry args={[1, 0.0001, 1]} />
						<meshStandardMaterial color={'green'} transparent opacity={0.2} />
					</mesh>
				);
			})}
		</group>
	);
}

interface PathTileProps {
	tiles: [number, number][];
	visible: boolean;
}

function PathTiles({ visible, ...props }: VisibleTilesProps) {
	return (
		<group name="path-tiles" visible={visible}>
			{props.tiles.map((tile, index) => {
				const [x, y] = tile;
				const tilePosition: any = [x, 0.25, -y];
				return (
					<mesh
						key={`path-tile-${index}`}
						position={tilePosition}
						receiveShadow>
						<boxGeometry args={[1, 0.0001, 1]} />
						<meshStandardMaterial color={'blue'} transparent opacity={0.2} />
					</mesh>
				);
			})}
		</group>
	);
}

interface UnknownTilesProps {
	tiles: [number, number][];
	visible: boolean;
}

function UnknownTiles({ visible, ...props }: UnknownTilesProps) {
	return (
		<group name="unknown-tiles" visible={visible}>
			{props.tiles.map((tile, index) => {
				const [x, y] = tile;
				const tilePosition: any = [x, 0.2, -y];
				return (
					<mesh
						key={`unknown-tile-${index}`}
						position={tilePosition}
						receiveShadow>
						<boxGeometry args={[1, 0.0001, 1]} />
						<meshStandardMaterial color={'white'} transparent opacity={0.2} />
					</mesh>
				);
			})}
		</group>
	);
}

interface DroneProps extends MeshProps {
	drone: Drone;
	droneRef: React.MutableRefObject<THREE.Mesh>;
	showAnimation: boolean;
}

function DroneMesh({ drone, droneRef, showAnimation }: DroneProps) {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useFrame((_, delta) => {
		const { x, y } = drone;

		if (showAnimation) {
			const speed = 1.8;
			const newX = position.x + (x - position.x) * speed * delta;
			const newY = position.y + (-y - position.y) * speed * delta;
			setPosition({ x: newX, y: newY });
			droneRef.current.position.set(newX, 1.5, newY);
		} else {
			droneRef.current.position.set(x, 1.5, -y);
		}
	});

	return (
		<mesh castShadow ref={droneRef}>
			<sphereGeometry args={[0.25, 32, 16]} />
			<meshStandardMaterial color={'blue'} />
		</mesh>
	);
}

interface TargetProps extends MeshProps {
	environment: Environment;
	targetRef: React.MutableRefObject<THREE.Mesh>;
	showAnimation: boolean;
}

function TargetMesh({ environment, targetRef, showAnimation }: TargetProps) {
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useFrame((_, delta) => {
		const { x, y } = environment.target;
		if (showAnimation) {
			const speed = 2;
			const newX = position.x + (x - position.x) * speed * delta;
			const newY = position.y + (-y - position.y) * speed * delta;
			setPosition({ x: newX, y: newY });
			targetRef.current.position.set(newX, 0.5, newY);
		} else {
			targetRef.current.position.set(x, 0.5, -y);
		}
	});

	return (
		<mesh castShadow ref={targetRef}>
			<boxGeometry args={[0.5, 1, 0.5]} />
			<meshStandardMaterial color={'orange'} />
		</mesh>
	);
}

interface SimulationCanvasProps {
	data: Simulation;
	currentFrameIndex: number;
	showAnimation: boolean;
	showVisTiles: boolean;
	showHostileTiles: boolean;
	showPathHistory: boolean;
	showUnknownTiles: boolean;
}

function SimulationCanvas(props: SimulationCanvasProps) {
	const { data, currentFrameIndex } = props;

	const grid_size = data[0].environment.terrain.size;
	const [grid_center_x, grid_center_z] = [
		(grid_size - 1) / 2,
		-(grid_size - 1) / 2,
	];
	const targetRef = useRef<THREE.Mesh>(null!);
	const droneRef = useRef<THREE.Mesh>(null!);

	return (
		<Canvas shadows>
			<PerspectiveCamera
				makeDefault
				fov={75}
				position={[grid_center_x * 3, grid_size / 2, grid_center_z]}
			/>
			<OrbitControls
				maxPolarAngle={Math.PI / 2}
				target={[grid_center_x, 0, grid_center_z]}
			/>
			<ambientLight />
			<directionalLight
				position={[grid_center_x, 20, grid_center_z]}
				intensity={1}
				color={'white'}
				castShadow
				shadow-camera-bottom={-grid_size * 2}
				shadow-camera-left={-grid_size * 2}
				shadow-camera-right={grid_size * 2}
				shadow-camera-top={grid_size * 2}
			/>
			<SkyBox />
			<TerrainMesh
				size={grid_size}
				position={[grid_center_x, 0, grid_center_z]}
			/>
			<group name="sim-objects">
				<TerrainTiles
					environment={data[currentFrameIndex].environment}
					tileSize={1}
					visible={props.showHostileTiles}
				/>
				<TargetMesh
					targetRef={targetRef}
					environment={data[currentFrameIndex].environment}
					showAnimation={props.showAnimation}
				/>
				<DroneMesh
					droneRef={droneRef}
					drone={data[currentFrameIndex].drone}
					showAnimation={props.showAnimation}
				/>
				<VisibleTiles
					tiles={data[currentFrameIndex].drone.visible_tiles}
					visible={props.showVisTiles}
				/>
				<PathTiles
					tiles={data[currentFrameIndex].drone.path_history}
					visible={props.showPathHistory}
				/>
				<UnknownTiles
					tiles={data[currentFrameIndex].drone.unknown_tiles}
					visible={props.showUnknownTiles}
				/>
			</group>
		</Canvas>
	);
}

export default SimulationCanvas;
