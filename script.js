var canvas, ctx, zoom = 9, lineWidth = 2, stageName, hueOffset = 22;

addEventListener("resize", canvasSize);

document.addEventListener("DOMContentLoaded", function () {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");
	const stageSortElement = document.getElementById("stageSort");
	const toggleOptionsElement = document.getElementById("toggleOptions");
	const snapshotElement = document.getElementById("snapshot");
	const statsCheckboxElement = document.getElementById("statsCheckbox");
	const controversialCheckboxElement = document.getElementById("controversialCheckbox");

	stageSortElement?.addEventListener("change", makeStageList);
	toggleOptionsElement?.addEventListener("click", toggleOptions);
	snapshotElement?.addEventListener("click", snapshot);
	statsCheckboxElement?.addEventListener("click", statsCheckbox);
	controversialCheckboxElement?.addEventListener("change", makeStageList);

	makeStageList();

	const displayOpts = document.querySelectorAll("[data-display]");
	for (const option of displayOpts) {
		option.addEventListener("change", draw);
	}

	canvasSize();
});

function stageCenter(stage) {
	var x = (stage.blast_zones[0] + stage.blast_zones[1]) / 2;
	var y = Number.MAX_VALUE;
	for (var spawn of stage.spawns) {
		if (spawn[1] < y) {
			y = spawn[1];
		}
	}
	return [x, y];
}

function isVertexOutOfBounds(stage, vertex) {
	const bounds = [stage.blast_zones[0], stage.blast_zones[1], stage.blast_zones[2], stage.blast_zones[3]];
	if (vertex[0] < bounds[0] || vertex[0] > bounds[1] || vertex[1] > bounds[2] || vertex[1] < bounds[3]) {
		return true;
	}
	return false;
}

function isBoundingBoxOutOfBounds(stage, boundingBox) {
	if (isVertexOutOfBounds(stage, boundingBox[0]) && isVertexOutOfBounds(stage, boundingBox[1])) {
		return true;
	}
	return false;
}

function clampVertex(stage, vertex) {
	const bounds = [stage.blast_zones[0], stage.blast_zones[1], stage.blast_zones[2], stage.blast_zones[3]];
	vertex[0] = Math.min(Math.max(vertex[0], bounds[0]), bounds[1]);
	vertex[1] = Math.min(Math.max(vertex[1], bounds[3]), bounds[2]);
	return vertex;
}

function cleanStages() {
	const cleanStages = [];
	for (const stage of hdrStages) {

		const stageBox = [[Number.MAX_VALUE, Number.MAX_VALUE], [Number.MIN_VALUE, Number.MIN_VALUE]];
		for (const collision of stage.collisions) {
			// ignore collisions with 0 volume
			if ((collision.boundingBox[0][0] == collision.boundingBox[1][0] && collision.boundingBox[0][1] == collision.boundingBox[1][1]) || isBoundingBoxOutOfBounds(stage, collision.boundingBox)) {
				collision.nocalc = true;
				continue;
			}
			stageBox[0][0] = Math.min(stageBox[0][0], collision.boundingBox[0][0]);
			stageBox[0][1] = Math.min(stageBox[0][1], collision.boundingBox[0][1]);
			stageBox[1][0] = Math.max(stageBox[1][0], collision.boundingBox[1][0]);
			stageBox[1][1] = Math.max(stageBox[1][1], collision.boundingBox[1][1]);
			const vertices = [];
			for (const vertex of collision.vertex) {
				vertices.push(clampVertex(stage, vertex));
			}
			collision.vertex = vertices;
		}

		for (const platform of stage.platforms) {
			// ignore platforms with 0 volume
			if ((platform.boundingBox[0][0] == platform.boundingBox[1][0] && platform.boundingBox[0][1] == platform.boundingBox[1][1]) || isBoundingBoxOutOfBounds(stage, platform.boundingBox)) {
				platform.nocalc = true;
				continue;
			}
			const vertices = [];
			for (const vertex of platform.vertex) {
				// filter platforms that are entirely contained in the stage
				if (stageBox[0][0] >= vertex[0] && vertex[0] <= stageBox[1][0] && stageBox[0][1] >= vertex[1] && vertex[1] <= stageBox[1][1]) {
					continue;
				}
				vertices.push(clampVertex(stage, vertex));
			}
			platform.vertex = vertices;
		}

		// filter stage if worthless
		if (!stage.collisions || stage.collisions.length == 0 || stage.collisions.every(e => e.nocalc) || blackList.includes(stage.stage)) {
			// remove stage from list
			continue;
		}

		if (controversialList.includes(stage.stage)) {
			stage.controversial = 1;
		}

		cleanStages.push(stage);
	}
	hdrStages = cleanStages;
}

function moveStagesToCenter() {
	for (const stage of hdrStages) {
		const center = stageCenter(stage);
		for (const collision of stage.collisions) {
			for (const vertex of collision.vertex) {
				vertex[0] -= center[0];
				vertex[1] -= center[1];
			}
			for (const vertex of collision.boundingBox) {
				vertex[0] -= center[0];
				vertex[1] -= center[1];
			}
		}
		for (const platform of stage.platforms) {
			for (const vertex of platform.vertex) {
				vertex[0] -= center[0];
				vertex[1] -= center[1];
			}
			for (const vertex of platform.boundingBox) {
				vertex[0] -= center[0];
				vertex[1] -= center[1];
			}
		}
		for (const vertex of stage.spawns) {
			vertex[0] -= center[0];
			vertex[1] -= center[1];
		}
		for (const vertex of stage.respawns) {
			vertex[0] -= center[0];
			vertex[1] -= center[1];
		}
		stage.blast_zones[0] -= center[0];
		stage.blast_zones[1] -= center[0];
		stage.blast_zones[2] -= center[1];
		stage.blast_zones[3] -= center[1];
		stage.camera[0] -= center[0];
		stage.camera[1] -= center[0];
		stage.camera[2] -= center[1];
		stage.camera[3] -= center[1];
	}
}

function makeStageList(e) {
	const stagelistDiv = document.getElementById("stagelist");
	const stageSort = document.getElementById("stageSort");
	const stagesLength = stagelistDiv?.children.length;

	cleanStages();
	moveStagesToCenter();

	sort(hdrStages, window[stageSort?.value]);

	for (var i = 1; i < (stagesLength ?? 0); i++) {
		if (stagelistDiv?.lastChild) {
			stagelistDiv.removeChild(stagelistDiv.lastChild);
		}
		// console.log(stagelistDiv.children);
	}

	if (!e) {
		for (const stage of hdrStages) {
			if (stage.stage == "Final Destination") {
				stage.checked = true;
			}
		}
	}

	const controversialCheckboxElement = document.getElementById("controversialCheckbox");

	for (const stage of hdrStages) {
		if (!stage.controversial || controversialCheckboxElement?.checked) {
			const label = document.createElement("label"),
				input = document.createElement("input"),
				span = document.createElement("span"),
				stat = document.createElement("div"),
				statType = stageSort?.options[stageSort.selectedIndex].textContent,
				statValue = fixDecimals(window[stageSort.value](stage));

			label.dataset.stage = stage.stage;

			span.textContent = stage.stage;

			if (stage.disclaimer) {
				span.textContent += "*";
				label.title = stage.disclaimer;
			}

			input.type = "checkbox";
			input.addEventListener("change", draw);

			if (stage.checked) {
				input.checked = true;
			}

			if (!isNaN(statValue)) {
				stat.textContent = statType + ": " + statValue;
			}
			else {
				stat.textContent = "Select a sort attribute"
			}

			stat.classList.add("stat");

			label.appendChild(input);
			label.appendChild(span);
			label.appendChild(stat);
			stagelistDiv?.appendChild(label);
		}
	}

	draw();
}

function statsCheckbox(e) {
	const target = e.currentTarget;
	const checked = target.checked;

	const optionsElement = document.getElementById("options");


	if (checked) {
		optionsElement?.classList.add("showStats");
	}
	else {
		optionsElement?.classList.remove("showStats");
	}
}

function toggleOptions(e) {
	document.getElementById("options")?.classList.toggle("hide");
}

function snapshot(e) {
	// canvasSize(1800, 1296);
	// canvasSize(1500, 1080);
	canvasSize(1920, 1400);
	// canvasSize(1200, 864);

	const dataURL = canvas.toDataURL('png'),
		downloadButton = document.getElementById("downloadButton");

	canvasSize();

	// console.log(dataURL);

	// window.open(dataURL, '_blank');


	// newTabImg(dataURL);


	downloadButton?.setAttribute("href", dataURL);
	downloadButton?.click();

}

function newTabImg(data) {
	const image = new Image();
	image.src = data;

	const w = window.open("");
	w?.document.write(image.outerHTML);
}


/*function toggleStage(e)
{
	var target = e.currentTarget,
		checked = target.checked;


}*/

function stageStatus(sName) {
	const stageLabel = document.querySelector('[data-stage="' + sName + '"]');

	return stageLabel?.querySelector("input")?.checked;
}

function getDisplayOption(optName) {
	const displayLabel = document.querySelector('[data-display="' + optName + '"]');

	return displayLabel?.querySelector("input")?.checked;
}

function labelColor(sName, hue) {
	const stageLabel = document.querySelector('[data-stage="' + sName + '"]');
	const input = stageLabel?.querySelector("input");
	const cColor = (typeof hue === "undefined") ? "transparent" : color(hue);
	if (!input) {
		return;
	}
	input.style.backgroundColor = cColor;
}

function canvasSize(w, h) {
	canvas.width = (typeof w === "number") ? w : document.body.clientWidth * window.devicePixelRatio;
	canvas.height = (typeof h === "number") ? h : document.body.clientHeight * window.devicePixelRatio;
	zoom = (typeof w === "number") ? w / 600 : Math.min(canvas.width / 550, canvas.height / 500);
	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineWidth = lineWidth;
	var hueIndex = 0;

	const controversialCheckboxElement = document.getElementById("controversialCheckbox");

	for (const stage of hdrStages) {
		if (!stage.controversial || controversialCheckboxElement?.checked) {
			stage.checked = stageStatus(stage.stage);

			if (stageStatus(stage.stage)) {
				//hueIndex++
				const hue = hueIndex++ * 360 / checkedStageCount() + (checkedStageCount() < 3 ? hueOffset : 0);//* 120;// + 120; //

				/*if (hueIndex == 1)
				{
					// hue = 60;
				}

				if (hueIndex == 2)
				{
					hue = 240;
				}*/

				labelColor(stage.stage, hue);

				stageName = stage.stage;

				ctx.setLineDash([10, 10]);

				if (getDisplayOption("blastzone")) {
					drawRect(stage.blast_zones, hue);
				}

				if (getDisplayOption("camera")) {
					// ctx.setLineDash([10, 10]);
					drawRect(stage.camera, hue);
				}

				ctx.setLineDash([]);

				if (getDisplayOption("stage")) {
					for (const collision of stage.collisions) {
						if (collision.nocalc) {
							continue;
						}
						drawPath(collision.vertex, hue);
					}
				}

				if (getDisplayOption("platforms")) {
					for (const platform of stage.platforms) {
						if (platform.nocalc) {
							continue;
						}
						drawPath(platform.vertex, hue);
					}
				}
			}
			else {
				labelColor(stage.stage);
			}
		}
	}
}

function checkedStageCount() {
	return document.querySelectorAll("#stagelist input:checked").length;
}

function drawRect(coords, hue) {
	// lineWidth = 1;
	drawPath([
		[coords[0], coords[2]],
		[coords[1], coords[2]],
		[coords[1], coords[3]],
		[coords[0], coords[3]],
		[coords[0], coords[2]]
	], hue);
	// lineWidth = 2;
}

function drawPath(coords, hue, fill) {
	// console.log(coords);

	ctx.beginPath();
	var coord = getRealCoordinate(coords[0][0], coords[0][1]);
	// console.log(coord);
	ctx.moveTo(coord.x, coord.y);

	for (var i = 1; i < coords.length; i++) {
		coord = getRealCoordinate(coords[i][0], coords[i][1]);
		// console.log(coord);
		ctx.lineTo(coord.x, coord.y);
	}

	if (fill) {
		ctx.fillStyle = color(hue);
		ctx.fill();
	}
	else {
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color(hue);
		ctx.stroke();
	}
}

function getRealSize(size) {
	return size * zoom;
}

function getRealCoordinate(x, y) {
	return {
		x: getRealSize(x) + canvas.width / 2,
		y: getRealSize(-y) + canvas.height / 2
	};
}

function color(hue, context = "normal") {
	const s = 100, l = 50, a = 1;

	/*if (context == "normal")
	{
		//s = 50;
		l = 100;
	}*/

	return "hsla(" + hue + ", " + s + "%, " + l + "%, " + a + ")";
}