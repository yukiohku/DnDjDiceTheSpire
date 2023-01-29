CharacterLoop();

function CharacterLoop(){
    creatureDescriptions();
    
    SetTSLinkToTableRowColumn("イニシアチブ修正値","init",3,1);
    SetTSLinkToTableRowColumn("攻撃1","attack",1,1);
    SetTSLinkToTableRowColumn("攻撃2","attack",1,1);
    SetTSLinkToTableRowColumn("攻撃3","attack",1,1);
    SetTSLinkToTableRowColumn("攻撃4","attack",1,1);
    SetTSLinkToTableRowColumn("攻撃5","attack",1,1);
    SetTSLinkToTableRowColumn("攻撃6","attack",1,1);
    SetTSLinkToTableColumn("セーヴィング・スロー","saving throw",1);
    SetTSLinkToTableColumn("戦技ボーナス","combat maneuver",1);
    SetTSLinkToTableColumn("技能名","skill",2);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/**
 * @param {string} fixed
 * @param {boolean} brackets
 * @param {boolean} d20
 * @param {?string} label
 * @returns {string}
 */
function linkGenerator(fixed, brackets, d20, label = "") {
    const innerText = brackets ? `(${fixed})` : fixed;
    label = label.replace(/ /g, "%20");
    let dice = d20 ? `1D20${fixed}` : fixed;
    if(dice.includes("d100")){
        dice = dice.replace(/d100/g, "d100+d10")
    }
    return `<a href="talespire://dice/${label}:${dice}" target="_self" class="talespireLink">${innerText}</a>`
}

/**
 * @param {string} sign
 * @param {string} mod
 * @param {?string} label
 * @returns {Node}
 */
function nodeLinkGenerator(sign, mod, label = "") {
    const a = document.createElement("a")
    label = label.replace(/ /g, "%20");
    if(mod == "0"){
        a.href = `talespire://dice/${label}:1d20`;
    }
    else{
        a.href = `talespire://dice/${label}:1d20${sign}${mod}`;
    }
    a.textContent = sign+mod;
    a.classList.add("talespireLink");
    a.style.zIndex = "10";
    return a;
}

/**
 * @param {Node} parentNode
 * @param {?Element} labelNode
 */
function nodeReplacer(parentNode, labelNode = null) {
    const ability = parentNode.querySelector(".ddbc-signed-number");
    // Checks cause this to fail
    if (ability === null) {
        return;
    }
    const sign = ability.firstElementChild.innerText;
    const ability_number = ability.lastElementChild;

    ability.removeChild(ability.firstChild);
    ability.removeChild(ability.firstChild);
    if (labelNode === null) {
        ability.appendChild(nodeLinkGenerator(sign, ability_number.textContent));
    }
    else {
        if(labelNode.classList.contains("ddbc-saving-throws-summary__ability-name")){
            ability.appendChild(nodeLinkGenerator(sign, ability_number.textContent, `${labelNode.textContent.toUpperCase()} Save`));
        }
        else{
            ability.appendChild(nodeLinkGenerator(sign, ability_number.textContent, labelNode.textContent));
        }
    }
}

function creatureDescriptions(){
    const regex = /(?<!:)(?<![#0-9])(?<!class="talespireLink">\()\d+d\d+ *[−+-]? *[−+-]?\d*/gmi;  //Thanks PanoramicPanda for the Regex :) // https://regex101.com/r/roZY8b/3
    const descriptionChecker = /(?<!:)(?<![#0-9])(?<!dicenotation=")(?<!class="talespireLink">\()\d+d\d+ *[−+-]? *[−+-]?\d*/m; //Thanks PanoramicPanda for the Regex :) https://regex101.com/r/0hUdgA/1

    const elements = document.querySelectorAll('table table:not(.TSExtensionAttacksModified)');
    for (const element of elements) {
        const currentText = element.innerHTML;
        const found = currentText.match(regex);
        if(found){
            for(const workingString of found) {
                let fixed = workingString.replace(/[ )(]/g,''); //Thanks PanoramicPanda for the Regex :)
                fixed = fixed.replace("−","-")
                fixed = fixed.replace("+-","-");

                element.innerHTML = element.innerHTML.replace(descriptionChecker, linkGenerator(fixed, true, false, ""))
            }
        }
      element.classList.add("TSExtensionAttacksModified");
    }
}

function SetTSLinkToTableColumn(str,label,columnIndex){
    const table = getTable(str);

    for(var i=0, rowLen=table.rows.length ;i<rowLen;i++){
        var target = table.rows[i].cells[columnIndex];
        if(!target){
            continue;
        }

        const elements = target.querySelectorAll('div font:not(.TSExtensionAttacksModified)');
        ReplaceLink(elements,label); 
  }
}

function SetTSLinkToTableRow(str,label,rowIndex){
    const table = getTable(str);
    var target = table.rows[rowIndex];
    const elements = target.querySelectorAll('div font:not(.TSExtensionAttacksModified)');
     
    ReplaceLink(elements,label);   
}

function SetTSLinkToTableRowColumn(str,label,rowIndex,columnIndex){
    const table = getTable(str);   
    var target = table.rows[rowIndex].cells[columnIndex];
    const elements = target.querySelectorAll('div font:not(.TSExtensionAttacksModified)');
    ReplaceLink(elements,label); 
}

// function GetCharacterName(){
//     const table = getHeaderTable("キャラクター名");   
//     var target = table.rows[1].cells[0];
//     const elements = target.querySelectorAll('div font b:not(.TSExtensionAttacksModified)');
    
//     var ret = elements[0].innerText.replace(/[^0-9a-z]/gi, '');
//     if(ret){
//         return ret;
//     }else{
//         return "no_name";
//     }
// }

function ReplaceLink(elements,label){
    const regex = /(?<!:)(?<![#0-9])(?<!class="talespireLink">)\>[+-]?\d+\</;  //Thanks PanoramicPanda for the Regex :) // https://regex101.com/r/roZY8b/3
    const regexInner = /(?<!:)(?<![#0-9])(?<!class="talespireLink">)[+-]?\d+/;
    const descriptionChecker = /(?<!:)(?<![#0-9])(?<!class="talespireLink">\()[+-]?\d+/; //Thanks PanoramicPanda for the Regex :) https://regex101.com/r/0hUdgA/1

    for (const element of elements) {     
        const currentText = element.innerHTML;
        const found = currentText.match(regex);
        if (found) {
            const foundInner = currentText.match(regexInner);
            for (const workingString of foundInner) {
                let fixed = workingString.replace(/[ )(]/g, ''); //Thanks PanoramicPanda for the Regex :)
                fixed = "+" + fixed;
                fixed = fixed.replace("−", "-")
                fixed = fixed.replace("+-", "-");
                element.innerHTML = element.innerHTML.replace(descriptionChecker, linkGenerator(fixed, false, true, label))
             }
        }
        element.classList.add("TSExtensionAttacksModified");
    } 
}
  
function getHeaderTable(str){
    const elements = document.querySelectorAll('table');
    for (const element of elements) {
        const text = element.innerHTML;
        const found = text.match(str);
        if(found){
            return element;
        }
    }
}

/**
 * @param {string} str
 */
function getTable(str){
    const elements = document.querySelectorAll('table table');
    for (const element of elements) {
        const text = element.innerHTML;
        const found = text.match(str);
        if(found){
            return element;
        }
    }
}
