import { ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "Attotheory";
var name = "Attotheory";
var description = "WOWOOWO I BACK NOW";

var authors = "Gaunter#7599, peanut#6368 - developed the theory \n XLII#0042, SnaekySnacks#1161 - developed the sim and helped balancing";
var version = "1.5.2";
var publicationExponent = 0.2;
var achievements;
requiresGameVersion("1.4.29");
// Currency
var rho;

var c1;
var q = BigNumber.ONE;

var init = () => {
  currency = theory.createCurrency();

  /////////////////////
  // Upgrades

  // c1
  {
    let getDesc = (level) => "c_1= "+ getC1(c1.level);
    let getInfo = (level) => "c_1=" + getC1(level).toString();
    c1 = theory.createUpgrade(1, rho, new ExponentialCost(1e5, Math.log2(18)));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  ////////////////////////////
  // Story Chapters

  
}

var updateAvailability = () => {
    //set that milestone
}

var tick = (elapsedTime, multiplier) => {
  let dt = BigNumber.from(elapsedTime * multiplier);
  q += BigNumber.ONE;
  currency.value += dt * getC1(c1.level) *
                         q.sqrt()
}

var getPrimaryEquation = () => {
  let result = "\\dot{\\rho} = c_1";

  result += " \\sqrt{q}"; 

  return result;
}
