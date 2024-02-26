function loadJSONFromURL(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText);
}

function initiateNicknameAssembly(nextByteCombinations) {
    var minPossibilities = {};
    var startingChar = "80";
    nextByteCombinations.forEach(nextByteCombination => {
        var linkCost = distanceDict[startingChar + nextByteCombination[0]] + distanceDict[nextByteCombination[0] + nextByteCombination[1]] + 2;
        if ((!isNaN(linkCost)) && (!(nextByteCombination[1] in minPossibilities) || ((nextByteCombination[1] in minPossibilities) && (linkCost < minPossibilities[nextByteCombination[1]][1])))) {
            minPossibilities[nextByteCombination[1]] = [nextByteCombination, linkCost]
        };
    });
    return Object.values(minPossibilities)
}

function iterateNicknameAssembly(nextByteCombinations, possibleNicknameList) {
    var minPossibilities = {};
    possibleNicknameList.forEach(nicknameData => {
        var startingChar = nicknameData[0].slice(-1);
        nextByteCombinations.forEach(nextByteCombination => {
            var linkCost = nicknameData[1] + distanceDict[startingChar + nextByteCombination[0]] + distanceDict[nextByteCombination[0] + nextByteCombination[1]] + 2;
            if ((!isNaN(linkCost)) && (!(nextByteCombination[1] in minPossibilities) || ((nextByteCombination[1] in minPossibilities) && (linkCost < minPossibilities[nextByteCombination[1]][1])))) {
                minPossibilities[nextByteCombination[1]] = [nicknameData[0].concat(nextByteCombination), linkCost]
            };
        });
    });
    return Object.values(minPossibilities)
}

function sanitizeInput() {
    var textBox = document.getElementById("Input")
    var input = textBox.value
    input = input.replace(/[^0-9a-f-A-F]/g, "").toUpperCase();
    textBox.value = input
}

function ConvertValueToCoordinates(value) {
    var xCoordinate = (parseInt("0x" + value, 16) % 16) * 16
    var yCoordinate = (parseInt("0x" + value, 16) - parseInt("0x" + value, 16) % 16)
    return [xCoordinate, yCoordinate]
}

function ConvertChecksumToCoordinates(checksum) {
    var lowCoordinate = ConvertValueToCoordinates((((checksum % 16) + 0xF6)%256).toString(16))
    var highCoordinate = ConvertValueToCoordinates((((checksum - checksum % 16)/16 + 0xF6)%256).toString(16))
    return [highCoordinate, lowCoordinate]
}

function ConvertChecksumToCoordinatesV2(checksum) {
    var lowCoordinate = ConvertValueToCoordinates(((((checksum % 16) + 0xF6)| 0x80)%256).toString(16))
    var highCoordinate = ConvertValueToCoordinates(((((checksum - checksum % 16)/16 + 0xF6)|0x80)%256).toString(16))
    return [highCoordinate, lowCoordinate]
}

function HookOutput(finalNicknameArray, language) {
    if (language != "German") {
        language = ""
    }
    var element = document.getElementById("Output");
    element.innerHTML = ""
    finalNicknameArray.forEach((finalNickname, idx) => {
        var tag = document.createElement("h1");
        var text = document.createTextNode("Nickname " + (idx + 1).toString());
        var tag2 = document.createElement("p");
        var text2 = document.createTextNode("Button presses required: " + finalNickname[2].toString() + " | Old style checksum: ");
        element.appendChild(tag);
        tag.appendChild(text);
        element.appendChild(tag2);
        tag2.appendChild(text2);

        var checksumCoordinates = ConvertChecksumToCoordinates(finalNickname[1])
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "rbyfont")
        checksumSpan.setAttribute("style", "background: url(/NicknameConverter/CharSets/Characterset_"+language+".png) -" + checksumCoordinates[0][0] + "px -" + checksumCoordinates[0][1] + "px;")
        tag2.appendChild(checksumSpan);
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "rbyfont")
        checksumSpan.setAttribute("style", "background: url(/NicknameConverter/CharSets/Characterset_"+language+".png) -" + checksumCoordinates[1][0] + "px -" + checksumCoordinates[1][1] + "px;")
        tag2.appendChild(checksumSpan);

        var text3 = document.createTextNode(" | New style checksum: ");
        tag2.appendChild(text3);

        var checksumCoordinatesV2 = ConvertChecksumToCoordinatesV2(finalNickname[1])
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "rbyfont")
        checksumSpan.setAttribute("style", "background: url(/NicknameConverter/CharSets/Characterset_"+language+".png) -" + checksumCoordinatesV2[0][0] + "px -" + checksumCoordinatesV2[0][1] + "px;")
        tag2.appendChild(checksumSpan);
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "rbyfont")
        checksumSpan.setAttribute("style", "background: url(/NicknameConverter/CharSets/Characterset_"+language+".png) -" + checksumCoordinatesV2[1][0] + "px -" + checksumCoordinatesV2[1][1] + "px;")
        tag2.appendChild(checksumSpan);
        var pTag = document.createElement("p")
        pTag.setAttribute("class", finalNickname[0])
        tag2.appendChild(pTag);
        (finalNickname[0]).forEach(value => {
            var childSpan = document.createElement("span")
            childSpan.setAttribute("class", "rbyfont")
            var coordinates = ConvertValueToCoordinates(value)
            childSpan.setAttribute("style", "background: url(/NicknameConverter/CharSets/Characterset_"+language+".png) -" + coordinates[0] + "px -" + coordinates[1] + "px;")
            pTag.appendChild(childSpan);
            });
    });
}

function convertCodes() {
    var language = document.getElementById("language").value
    if (language == "German"){
        combinedDict = loadJSONFromURL('./Dictionaries/NickConvCombinedDictGerman.json')
        distanceDict = loadJSONFromURL('./Dictionaries/NickConvDistanceDictGerman.json')
    } else {
        combinedDict = loadJSONFromURL('./Dictionaries/NickConvCombinedDict.json')
        distanceDict = loadJSONFromURL('./Dictionaries/NickConvDistanceDict.json')
    }   
    var textBox = document.getElementById("Input")
    var input = textBox.value
    if (input.length % 2 != 0) {
        input = input.padEnd(input.length + 1, "0")
    }
    if (input.length % 10 != 0) {
        input = input.padEnd(input.length + (10 - input.length % 10), "0")
    }
    console.log(input)
    var finalNicknameArray = []
    for (let index = 0; index < input.length; index += 10) {
        var assembledNickname = []
        var checksum = 128
        var nicknameCode = input.slice(index, index + 10)
        for (let byteIndex = 0; byteIndex < 10; byteIndex += 2) {
            var byteString = nicknameCode.slice(byteIndex, byteIndex + 2)
            checksum += parseInt(byteString, 16)
            if (byteIndex == 0) {
                assembledNickname = initiateNicknameAssembly(combinedDict[byteString])
            } else {
                assembledNickname = iterateNicknameAssembly(combinedDict[byteString], assembledNickname)
            }
        }

        var minLinkCost = assembledNickname[0][1]
        var finalNickname = assembledNickname[0][0]
        for (let i = 0; i < assembledNickname.length; i++) {
            if (assembledNickname[i][1] < minLinkCost) {
                minLinkCost = assembledNickname[i][1]
                finalNickname = assembledNickname[i][0]
            }
        }
        finalNicknameArray.push([finalNickname, checksum % 256, minLinkCost])
    }
    finalNicknameArray.forEach(finalNickname => {
        console.log(finalNickname[0])
    });
    HookOutput(finalNicknameArray, language)
}