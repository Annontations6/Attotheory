import { ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "Attotheory";
var name = "Attotheory";
var description = "WOWOOWO I BACK NOW";

var authors = "Annontations6";
var version = "0.0.1";
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
    c1 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(2)));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  // c2
  {
    let getDesc = (level) => "c_2= \\sqrt{"+ getC1(c2.level) + "}";
    let getInfo = (level) => "c_2=" + getC2(level).toString();
    c2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(2)));
    c2.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c2.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
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
                         getC2(c2.level) *
                         q.sqrt()
}

var getPrimaryEquation = () => {
  let result = "\\dot{\\rho} = c_1";

  result += " \\sqrt{q}"; 

  return result;
}

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => Utils.getStepwisePowerSum(level, 6, 36, 1).sqrt();

init();