var canvas, ctx, zoom = 9, lineWidth = 2, stageName, hueOffset = 22;

addEventListener("resize", canvasSize);

document.addEventListener("DOMContentLoaded", function () {
	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");

	document.getElementById("stageSort").addEventListener("change", makeStageList);

	document.getElementById("toggleOptions").addEventListener("click", toggleOptions);
	document.getElementById("snapshot").addEventListener("click", snapshot);

	document.getElementById("statsCheckbox").addEventListener("click", statsCheckbox);
	document.getElementById("controversialCheckbox").addEventListener("change", makeStageList);

	makeStageList();

	var displayOpts = document.querySelectorAll("[data-display]");

	for (var i = 0; i < displayOpts.length; i++) {
		displayOpts[i].addEventListener("change", draw);
	}

	canvasSize();
});

function makeStageList(e) {
	var stagelistDiv = document.getElementById("stagelist"),
		stageSort = document.getElementById("stageSort"),
		stagesLength = stagelistDiv.children.length;

	sort(stages, window[stageSort.value]);

	for (var i = 1; i < stagesLength; i++) {
		stagelistDiv.removeChild(stagelistDiv.lastChild);

		// console.log(stagelistDiv.children);
	}

	if (!e) {
		stages[0].checked = true;
	}

	for (var s = 0; s < stages.length; s++) {
		if (!stages[s].controversial || document.getElementById("controversialCheckbox").checked) {
			var label = document.createElement("label"),
				input = document.createElement("input"),
				span = document.createElement("span"),
				stat = document.createElement("div"),
				statType = stageSort.options[stageSort.selectedIndex].textContent,
				statValue = fixDecimals(window[stageSort.value](stages[s]));

			label.dataset.stage = stages[s]["name"];

			span.textContent = stages[s]["name"];

			if (stages[s].disclaimer) {
				span.textContent += "*";
				label.title = stages[s].disclaimer;
			}

			input.type = "checkbox";
			input.addEventListener("change", draw);

			if (stages[s].checked) {
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
			stagelistDiv.appendChild(label);
		}
	}

	draw();
}

function statsCheckbox(e) {
	var target = e.currentTarget,
		checked = target.checked,
		options = document.getElementById("options");

	if (checked) {
		options.classList.add("showStats");
	}
	else {
		options.classList.remove("showStats");
	}
}

function toggleOptions(e) {
	document.getElementById("options").classList.toggle("hide");
}

function snapshot(e) {
	// canvasSize(1800, 1296);
	// canvasSize(1500, 1080);
	canvasSize(1920, 1400);
	// canvasSize(1200, 864);

	var dataURL = canvas.toDataURL('png'),
		downloadButton = document.getElementById("downloadButton");

	canvasSize();

	// console.log(dataURL);

	// window.open(dataURL, '_blank');


	// newTabImg(dataURL);


	downloadButton.setAttribute("href", dataURL);
	downloadButton.click();

}

function newTabImg(data) {
	var image = new Image();
	image.src = data;

	var w = window.open("");
	w.document.write(image.outerHTML);
}


/*function toggleStage(e)
{
	var target = e.currentTarget,
		checked = target.checked;


}*/

function stageStatus(sName) {
	var stageLabel = document.querySelector('[data-stage="' + sName + '"]');

	return stageLabel.querySelector("input").checked;
}

function getDisplayOption(optName) {
	var displayLabel = document.querySelector('[data-display="' + optName + '"]');

	return displayLabel.querySelector("input").checked;
}

function labelColor(sName, hue) {
	var stageLabel = document.querySelector('[data-stage="' + sName + '"]'),
		input = stageLabel.querySelector("input"),
		cColor = (typeof hue === "undefined") ? "transparent" : color(hue);

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
	hueIndex = 0;

	for (var s = 0; s < stages.length; s++) {
		if (!stages[s].controversial || document.getElementById("controversialCheckbox").checked) {
			stages[s].checked = stageStatus(stages[s]["name"]);

			if (stageStatus(stages[s]["name"])) {
				//hueIndex++
				var hue = hueIndex++ * 360 / checkedStageCount() + (checkedStageCount() < 3 ? hueOffset : 0);//* 120;// + 120; //

				/*if (hueIndex == 1)
				{
					// hue = 60;
				}

				if (hueIndex == 2)
				{
					hue = 240;
				}*/

				labelColor(stages[s]["name"], hue);

				stageName = stages[s]["name"];

				ctx.setLineDash([10, 10]);

				if (getDisplayOption("blastzone")) {
					drawRect(stages[s]["blast_zones"], hue);
				}

				if (getDisplayOption("camera")) {
					// ctx.setLineDash([10, 10]);
					drawRect(stages[s]["camera"], hue);
				}

				ctx.setLineDash([]);

				if (getDisplayOption("stage")) {
					for (var i = 0; i < stages[s]["collisions"].length; i++) {
						drawPath(stages[s]["collisions"][i]["vertex"], hue);
					}
				}

				if (getDisplayOption("platforms")) {
					for (var i = 0; i < stages[s]["platforms"].length; i++) {
						drawPath(stages[s]["platforms"][i]["vertex"], hue);
					}
				}
			}
			else {
				labelColor(stages[s]["name"]);
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

	var coord;

	ctx.beginPath();
	coord = getRealCoordinate(coords[0][0], coords[0][1]);
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
	var s = 100, l = 50, a = 1;

	/*if (context == "normal")
	{
		//s = 50;
		l = 100;
	}*/

	return "hsla(" + hue + ", " + s + "%, " + l + "%, " + a + ")";
}