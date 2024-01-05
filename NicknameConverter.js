function loadJSONFromURL(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText);
}

function initiateMailAssembly(nextByteCombinations, language) {
    var minPossibilities = {};
    if (language == "Korean") {
        var startingChar = "00";
    } else if (language = "Japanese") {
        var startingChar = "B1";
    } else {
        var startingChar = "80";
    }
    nextByteCombinations.forEach(nextByteCombination => {
        var linkCost = distanceDict[startingChar + nextByteCombination[0]] + distanceDict[nextByteCombination[0] + nextByteCombination[1]] + 2;
        if ((!isNaN(linkCost)) && (!(nextByteCombination[1] in minPossibilities) || ((nextByteCombination[1] in minPossibilities) && (linkCost < minPossibilities[nextByteCombination[1]][1])))) {
            minPossibilities[nextByteCombination[1]] = [nextByteCombination, linkCost]
        };
    });
    return Object.values(minPossibilities)
}

function iterateMailAssembly(nextByteCombinations, possibleMailList) {
    var minPossibilities = {};
    possibleMailList.forEach(mailData => {
        var startingChar = mailData[0].slice(-1);
        nextByteCombinations.forEach(nextByteCombination => {
            var linkCost = mailData[1] + distanceDict[startingChar + nextByteCombination[0]] + distanceDict[nextByteCombination[0] + nextByteCombination[1]] + 2;
            if ((!isNaN(linkCost)) && (!(nextByteCombination[1] in minPossibilities) || ((nextByteCombination[1] in minPossibilities) && (linkCost < minPossibilities[nextByteCombination[1]][1])))) {
                minPossibilities[nextByteCombination[1]] = [mailData[0].concat(nextByteCombination), linkCost]
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

function ConvertValueToKoreanCoordinates(value) {
    var xCoordinate = (parseInt("0x" + value, 16) % 16) * 16
    var yCoordinate = (parseInt("0x" + value, 16) - parseInt("0x" + value, 16) % 16) * 2
    return [xCoordinate, yCoordinate]
}

function ConvertValueToCoordinates(value) {
    var xCoordinate = (parseInt("0x" + value, 16) % 16) * 16
    var yCoordinate = (parseInt("0x" + value, 16) - parseInt("0x" + value, 16) % 16)
    return [xCoordinate, yCoordinate]
}

function ConvertChecksumToCoordinates(checksum, language, version) {
    if (language == "Japanese" && version == "GS") {
        var lowCoordinate = ConvertValueToCoordinates((((checksum % 16) + 0xF6)%256|0x60).toString(16))
        var highCoordinate = ConvertValueToCoordinates((((checksum - checksum % 16)/16 + 0xF6)%256|0x60).toString(16))
    } else {
        var lowCoordinate = ConvertValueToCoordinates((((checksum % 16) + 0xF6)%256).toString(16))
        var highCoordinate = ConvertValueToCoordinates((((checksum - checksum % 16)/16 + 0xF6)%256).toString(16))
    }
    return [highCoordinate, lowCoordinate]
}

function HookOutput(finalMailArray, language, version) {
    var element = document.getElementById("Output");
    element.innerHTML = ""
    finalMailArray.forEach((finalMail, idx) => {
        var tag = document.createElement("h1");
        var text = document.createTextNode("Mail " + (idx + 1).toString());
        var tag2 = document.createElement("p");
        var text2 = document.createTextNode("Button presses required: " + finalMail[2].toString() + " | checksum: ");
        element.appendChild(tag);
        tag.appendChild(text);
        element.appendChild(tag2);
        tag2.appendChild(text2);
        var checksumCoordinates = ConvertChecksumToCoordinates(finalMail[1], language, version)
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "gscfont")
        checksumSpan.setAttribute("style", "background: url(/MailConverter/CharSets/Characterset_"+language+version+".png) -" + checksumCoordinates[0][0] + "px -" + checksumCoordinates[0][1] + "px;")
        tag2.appendChild(checksumSpan);
        var checksumSpan = document.createElement("span")
        checksumSpan.setAttribute("class", "gscfont")
        checksumSpan.setAttribute("style", "background: url(/MailConverter/CharSets/Characterset_"+language+version+".png) -" + checksumCoordinates[1][0] + "px -" + checksumCoordinates[1][1] + "px;")
        tag2.appendChild(checksumSpan);
        for (let rowCount = 0; rowCount < 2; rowCount++) {
            var pTag = document.createElement("p")
            pTag.setAttribute("class", finalMail[0][rowCount])
            tag2.appendChild(pTag);
            (finalMail[0].slice(rowCount * 16, (rowCount + 1) * 16)).forEach(value => {
                var childSpan = document.createElement("span")
                if (language == "Korean") {
                    childSpan.setAttribute("class", "korgscfont")
                    var coordinates = ConvertValueToKoreanCoordinates(value)
                    childSpan.setAttribute("style", "background: url(/MailConverter/CharSets/Characterset_KoreanGSMail.png) -" + coordinates[0] + "px -" + coordinates[1] + "px;")
                } else {
                    childSpan.setAttribute("class", "gscfont")
                    var coordinates = ConvertValueToCoordinates(value)
                    childSpan.setAttribute("style", "background: url(/MailConverter/CharSets/Characterset_"+language+version+".png) -" + coordinates[0] + "px -" + coordinates[1] + "px;")
                }
                pTag.appendChild(childSpan);
                });
        }
    });
}

function convertCodes() {
    var language = document.getElementById("language").value
    var version = document.getElementById("version").value
    combinedDict = loadJSONFromURL('./Dictionaries/MailConvCombinedDict'+language+'.json')
    distanceDict = loadJSONFromURL('./Dictionaries/MailConvDistanceDict'+language+'.json')
    var textBox = document.getElementById("Input")
    var input = textBox.value
    if (input.length % 2 != 0) {
        input = input.padEnd(input.length + 1, "0")
    }
    if ((input.length % 32 != 0) && (language == "Korean")) {
        input = input.padEnd(input.length + (32 - input.length % 32), "0")
    } else if (input.length % 32 != 0) {
        input = input.padEnd(input.length + (32 - input.length % 32), "10")
    }
    console.log(input)
    var finalMailArray = []
    for (let index = 0; index < input.length; index += 32) {
        var assembledMail = []
        var checksum = 0
        var mailCode = input.slice(index, index + 32)
        for (let byteIndex = 0; byteIndex < 32; byteIndex += 2) {
            var byteString = mailCode.slice(byteIndex, byteIndex + 2)
            checksum += parseInt(byteString, 16)
            if (byteIndex == 0) {
                assembledMail = initiateMailAssembly(combinedDict[byteString], language)
            } else {
                assembledMail = iterateMailAssembly(combinedDict[byteString], assembledMail)
            }
        }

        var minLinkCost = assembledMail[0][1]
        var finalMail = assembledMail[0][0]
        for (let i = 0; i < assembledMail.length; i++) {
            if (assembledMail[i][1] < minLinkCost) {
                minLinkCost = assembledMail[i][1]
                finalMail = assembledMail[i][0]
            }
        }
        finalMailArray.push([finalMail, checksum % 256, minLinkCost])
    }
    finalMailArray.forEach(finalMail => {
        console.log(finalMail[0])
    });
    HookOutput(finalMailArray, language, version)
}

function changeVersion() {
    var selectedLanguage = document.getElementById("language")
    var selectedVersion = document.getElementById("version")
    if (selectedLanguage.value == "Korean") {
        selectedVersion.value = "GS"
        if (selectedVersion.length > 1) {
            selectedVersion.remove(selectedVersion.length-1);
          }
    } else {
        if (selectedVersion.length < 2) {
            var option = document.createElement("option");
            option.text = "Crystal";
            option.setAttribute("value","C")
            selectedVersion.add(option);
          }
    }
}