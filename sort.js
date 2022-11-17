var rect = {
	l: 0,
	r: 1,
	t: 2,
	b: 3
};



function fixDecimals(n) {
	/*n = n.toString();

	var match = n.indexOf("0000");

	if (match >= 0)
	{
		n = n.substring(0, match);
	}

	return n;*/

	return Math.round(n * 1000) / 1000;
}

function sort(arr, func) {
	// arr.sort((a, b) => func(a) - func(b));
	arr.sort((a, b) => sortFunc(func, a, b));
}

/*function defaultSort(stage)
{
	return 0;
}*/

function sortFunc(func, a, b) {
	a = func(a);
	b = func(b);

	if (a < b) { return -1; }
	if (a > b) { return 1; }
	return 0;
}

function alphabetical(stage) {
	return stage.name;
}

function platformCount(stage) {
	return stage.platforms.length;
}

function blastzoneLeft(stage) {
	return stage.blast_zones[0];
}

function blastzoneRight(stage) {
	return stage.blast_zones[1];
}

function blastzoneTop(stage) {
	return stage.blast_zones[2];
}

function blastzoneBottom(stage) {
	return stage.blast_zones[3];
}

function cameraWidth(stage) {
	return stage.camera[1] - stage.camera[0];
}

function cameraHeight(stage) {
	return stage.camera[2] - stage.camera[3];
}

function blastzoneWidth(stage) {
	return blastzoneRight(stage) - blastzoneLeft(stage);
}

function blastzoneHeight(stage) {
	return blastzoneTop(stage) - blastzoneBottom(stage);
}

function stageLeft(stage) {
	var most = 0;

	for (var i = 0; i < stage.collisions.length; i++) {
		for (var j = 0; j < stage.collisions[i].vertex.length; j++) {
			if (stage.collisions[i].vertex[j][0] < most && !stage.collisions[i].nocalc) {
				most = stage.collisions[i].vertex[j][0];
			}
		}
	}

	return most;
}

function stageRight(stage) {
	var most = 0;

	for (var i = 0; i < stage.collisions.length; i++) {
		for (var j = 0; j < stage.collisions[i].vertex.length; j++) {
			if (stage.collisions[i].vertex[j][0] > most && stage.collisions[i].vertex[j][1] > stage.camera[3] && !stage.collisions[i].nocalc) {
				most = stage.collisions[i].vertex[j][0];
			}
		}
	}

	return most;
}

function stageTop(stage) {
	var most = 0;

	for (var i = 0; i < stage.collisions.length; i++) {
		for (var j = 0; j < stage.collisions[i].vertex.length; j++) {
			if (stage.collisions[i].vertex[j][1] > most && stage.collisions[i].vertex[j][1] > stage.camera[3] && !stage.collisions[i].nocalc) {
				most = stage.collisions[i].vertex[j][1];
			}
		}
	}

	return most;
}


/*function widestPlatform(stage)
{
	var most = 0;

	for (var i = 0; i < stage.platforms.length; i++)
	{
		for (var j = 0; j < stage.platforms[i].vertex.length; j++)
		{
			if (stage.platforms[i].vertex[j][0] < most)
			{
				most = stage.platforms[i].vertex[j][0];
			}
		}
	}

	return most;
}*/


function platformLeft(stage) {
	var most = 0;

	for (var i = 0; i < stage.platforms.length; i++) {
		for (var j = 0; j < stage.platforms[i].vertex.length; j++) {
			if (stage.platforms[i].vertex[j][0] < most) {
				most = stage.platforms[i].vertex[j][0];
			}
		}
	}

	return most;
}

function platformRight(stage) {
	var most = 0;

	for (var i = 0; i < stage.platforms.length; i++) {
		for (var j = 0; j < stage.platforms[i].vertex.length; j++) {
			if (stage.platforms[i].vertex[j][0] > most) {
				most = stage.platforms[i].vertex[j][0];
			}
		}
	}

	return most;
}

function platformOrStageLeft(stage) {
	return Math.min(platformLeft(stage), stageLeft(stage));
}

function platformOrStageRight(stage) {
	return Math.max(platformRight(stage), stageRight(stage));
}

function platformTop(stage) {
	var most = 0;

	for (var i = 0; i < stage.platforms.length; i++) {
		for (var j = 0; j < stage.platforms[i].vertex.length; j++) {
			if (stage.platforms[i].vertex[j][1] > most) {
				most = stage.platforms[i].vertex[j][1];
			}
		}
	}

	return Math.max(most, stageTop(stage));
}

function platformBottom(stage) {
	var most = platformTop(stage);

	for (var i = 0; i < stage.platforms.length; i++) {
		for (var j = 0; j < stage.platforms[i].vertex.length; j++) {
			if (stage.platforms[i].vertex[j][1] < most) {
				most = stage.platforms[i].vertex[j][1];
			}
		}
	}

	return Math.max(most, stageTop(stage));
}

function stageToPlatformTop(stage) {
	return platformTop(stage) - stageTop(stage);
}

function stageToPlatformBottom(stage) {
	return platformBottom(stage) - stageTop(stage);
}

function stageWidth(stage) {
	return stageRight(stage) - stageLeft(stage);
}

function stageLeftToBlastzoneLeft(stage) {
	return stageLeft(stage) - blastzoneLeft(stage);
}

function stageRightToBlastzoneRight(stage) {
	return blastzoneRight(stage) - stageRight(stage);
}

function stageToBlastzoneTop(stage) {
	return blastzoneTop(stage) - stageTop(stage);
}

function stageToBlastzoneBottom(stage) {
	return stageTop(stage) - blastzoneBottom(stage);
}


function stageToCameraBottom(stage) {
	return stageTop(stage) - stage.camera[3];
}


function platformWidth(stage) {
	return platformRight(stage) - platformLeft(stage);
}

function platformHeight(stage) {
	return platformTop(stage) - platformBottom(stage);
}

function platformAndStageWidth(stage) {
	return platformOrStageRight(stage) - platformOrStageLeft(stage);
}

function platformOrStageLeftToBlastzoneLeft(stage) {
	return platformOrStageLeft(stage) - blastzoneLeft(stage);
}

function platformOrStageRightToBlastzoneRight(stage) {
	return blastzoneRight(stage) - platformOrStageRight(stage);
}

function platformToBlastzoneTop(stage) {
	return blastzoneTop(stage) - platformTop(stage);
}


function stageAsymmetry(stage) {
	return stageLeft(stage) + stageRight(stage);
}

function platformAsymmetry(stage) {
	return platformLeft(stage) + platformRight(stage);
}

function blastzoneAsymmetry(stage) {
	return blastzoneLeft(stage) + blastzoneRight(stage);
}

function stageToBlastzoneAsymmetry(stage) {
	return stageLeftToBlastzoneLeft(stage) - stageRightToBlastzoneRight(stage);
}

function platformToBlastzoneAsymmetry(stage) {
	return platformOrStageLeftToBlastzoneLeft(stage) - platformOrStageRightToBlastzoneRight(stage);
}