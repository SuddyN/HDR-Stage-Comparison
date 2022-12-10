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

function makeStageList(e) {
	const stagelistDiv = document.getElementById("stagelist");
	const stageSort = document.getElementById("stageSort");
	const stagesLength = stagelistDiv?.children.length;

	sort(hdrStages, window[stageSort?.value]);

	for (var i = 1; i < (stagesLength ?? 0); i++) {
		if (stagelistDiv?.lastChild) {
			stagelistDiv.removeChild(stagelistDiv.lastChild);
		}
		// console.log(stagelistDiv.children);
	}

	if (!e) {
		hdrStages[0].checked = true;
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
					for (var i = 0; i < stage.collisions.length; i++) {
						drawPath(stage.collisions[i].vertex, hue);
					}
				}

				if (getDisplayOption("platforms")) {
					for (var i = 0; i < stage.platforms.length; i++) {
						drawPath(stage.platforms[i].vertex, hue);
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