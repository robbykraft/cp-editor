import * as THREE from "three";

export const calculateTouches = (model, raycaster) => {
	// simulator must have a model loaded
	if (!model) { return []; }
	const intersections = raycaster
		.intersectObjects([model.frontside, model.backside]);
	const date = Date.now();
	// for every intersection point, calculate a few more properties
	intersections.forEach(touch => {
		touch.date = date;
		// the face being touched
		touch.face_vertices = [touch.face.a, touch.face.b, touch.face.c];
		touch.material = touch.face.materialIndex;
		touch.normal = touch.face.normal;
		touch.face = touch.faceIndex;
		touch.hover = touch.point;
		delete touch.faceIndex;
		// delete touch.point;
		// for the face being touched, calculate the distances from
		// the touch point to each of the triangle's points
		touch.touch_face_vertices_distance = touch.face_vertices
			.map(f => [0, 1, 2].map(n => model.positions[f * 3 + n]))
			.map(v => new THREE.Vector3(...v))
			.map(p => p.distanceTo(touch.point));
		// find the nearest vertex in the graph to the touch point
		const nearestFaceVertex = touch.touch_face_vertices_distance
			.map((d, i) => ({ d, i }))
			.sort((a, b) => a.d - b.d)
			.map(el => el.i)
			.shift();
		touch.vertex = touch.face_vertices[nearestFaceVertex];
		// get the nearest vertex's coords (in 3D)
		touch.vertex_coords = new THREE.Vector3(
			model.positions[touch.vertex * 3 + 0],
			model.positions[touch.vertex * 3 + 1],
			model.positions[touch.vertex * 3 + 2]);
	});
	return intersections;
};
