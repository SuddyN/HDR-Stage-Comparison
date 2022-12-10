import json

def stageLeft(stage):
    most = 0

    for i in stage["collisions"]:
        flag = False
        try:
            flag = i["nocalc"]
        except KeyError:
            flag = False
        for j in i["vertex"]:
            if j[0] < most and not flag:
                most = j[0]
                
    return most

def stageRight(stage):
    most = 0
    
    for i in stage["collisions"]:
        flag = False
        try:
            flag = i["nocalc"]
        except KeyError:
            flag = False
        for j in i["vertex"]:
            if j[0] > most and j[1] > stage["camera"][3] and not flag:
                most = j[0]
                    
    return most

def stageTop(stage):
    most = 0
    
    for i in stage["collisions"]:
        flag = False
        try:
            flag = i["nocalc"]
        except KeyError:
            flag = False
        for j in i["vertex"]:
            if j[1] > most and j[1] > stage["camera"][3] and not flag:
                most = j[1]
                
    return most

def main():
    with open('stages.json') as file:
        data = file.read()
        stageJson = json.loads(data)
        for stage in stageJson:
            left = stageLeft(stage)
            right = stageRight(stage)
            center = (right + left) / 2
            top = stageTop(stage)
            for collision in stage["collisions"]:
                for vertex in collision["vertex"]:
                    vertex[0] -= center
                    vertex[1] -= top
                for vertex in collision["boundingBox"]:
                    vertex[0] -= center
                    vertex[1] -= top
            for platform in stage["platforms"]:
                for vertex in platform["vertex"]:
                    vertex[0] -= center
                    vertex[1] -= top
                for vertex in platform["boundingBox"]:
                    vertex[0] -= center
                    vertex[1] -= top
            for vertex in stage["spawns"]:
                vertex[0] -= center
                vertex[1] -= top
            for vertex in stage["respawns"]:
                vertex[0] -= center
                vertex[1] -= top
            stage["blast_zones"][0] -= center
            stage["blast_zones"][1] -= center
            stage["blast_zones"][2] -= top
            stage["blast_zones"][3] -= top
            stage["camera"][0] -= center
            stage["camera"][1] -= center
            stage["camera"][2] -= top
            stage["camera"][3] -= top
            with open("output.json", "w") as output:
                output.write(json.dumps(stageJson, indent=4))
            

if __name__ == "__main__":
    main()