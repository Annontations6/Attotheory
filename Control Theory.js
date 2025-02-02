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
    c1 = theory.createUpgrade(0, currency, new ExponentialCost(5, Math.log2(2)));
    c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  // c2
  {
    let getDesc = (level) => "c_2= \\sqrt{"+ Utils.getStepwisePowerSum(level, 6, 36, 1) + "}";
    let getInfo = (level) => "c_2=" + getC2(level).toString();
    c2 = theory.createUpgrade(1, currency, new ExponentialCost(35, Math.log2(2)));
    c2.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    c2.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  // q1
  {
    let getDesc = (level) => "q_1= "+ getQ1(c1.level);
    let getInfo = (level) => "q_1=" + getQ1(level).toString();
    q1 = theory.createUpgrade(2, currency, new ExponentialCost(4.2e9, Math.log2(3)));
    q1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
    q1.getInfo = (amount) => Utils.getMathTo(getInfo(c1.level), getInfo(c1.level + amount));
  }

  // q2
  {
    let getDesc = (level) => "q_2= "+ getQ1(c1.level);
    let getInfo = (level) => "q_2=" + getQ1(level).toString();
    q2 = theory.createUpgrade(3, currency, new ExponentialCost(1e14, Math.log2(3)));
    q2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
    q2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
  }

  /////////////////////
  // Permanent Upgrades
   theory.createPublicationUpgrade(0, currency, 1e7);
   theory.createBuyAllUpgrade(1, currency, 1e12);
   theory.createAutoBuyerUpgrade(2, currency, 1e35);


  ///////////////////////
  //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(8, 5));

    {
      unlockQ1 = theory.createMilestoneUpgrade(0, 1);
      unlockQ1.description = "Unlock at " + Utils.getMath("q_1");
      unlockQ1.info = "Unlock at combitor " + Utils.getMath("q_1");
      unlockQ1.boughtOrRefunded = (_) => {
        updateAvailability();
        theory.invalidatePrimaryEquation()
      };
  }

  {
    q1Exp = theory.createMilestoneUpgrade(1, 3);
    q1Exp.description = Localization.getUpgradeIncCustomExpDesc("q_1", "0.05");
    q1Exp.info = Localization.getUpgradeIncCustomExpInfo("q_1", "0.05");
    q1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
  }

  {
    c1Exp = theory.createMilestoneUpgrade(2, 3);
    c1Exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.1");
    c1Exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.1");
    c1Exp.boughtOrRefunded = (_) => {
       updateAvailability();
       theory.invalidatePrimaryEquation();
    };
  }

  {
    unlockQ2 = theory.createMilestoneUpgrade(3, 1);
    unlockQ2.description = "Unlock at " + Utils.getMath("q_2");
    unlockQ2.info = "Unlock at combitor " + Utils.getMath("q_2");
    unlockQ2.boughtOrRefunded = (_) => {
      updateAvailability();
      theory.invalidatePrimaryEquation()
    };
}


  ////////////////////////////
  // Story Chapters

  updateAvailability();
}

var updateAvailability = () => {
   q1.isAvailable = unlockQ1.level > 0;
   q1Exp.isAvailable = unlockQ1.level > 0;
   c1Exp.isAvailable = unlockQ1.level > 0;
   unlockQ2.isAvailable = unlockQ1.level > 0;
   q2.isAvailable = unlockQ2.level > 0;
}

var tick = (elapsedTime, multiplier) => {
  let dt = BigNumber.from(elapsedTime * multiplier);
  let bonus = theory.publicationMultiplier;
  q += BigNumber.ONE *
       getQ1(q1.level);
  currency.value += dt * bonus.sqrt() * getC1(c1.level) *
                                        getC2(c2.level).pow(getC1Exponent(c1Exp.level)) *
                                        getQ1(q1.level).pow(getQ1Exponent(q1Exp.level)) *
                                        getQ2(q2.level) *
                                        q.sqrt()
}

var getPrimaryEquation = () => {
  let result = "\\dot{\\rho} = c_1";

  if (c1Exp.level == 1) result += "^{1.1}";
  if (c1Exp.level == 2) result += "^{1.2}";
  if (c1Exp.level == 3) result += "^{1.3}";

  result += "c_2"; 

  if (unlockQ1.level > 0) result += "q_1"; 

  if (q1Exp.level == 1) result += "^{1.05}";
  if (q1Exp.level == 2) result += "^{1.1}";
  if (q1Exp.level == 3) result += "^{1.15}";

  if (unlockQ2.level > 0) result += "q_2"; 

  result += " \\sqrt{q}"; 

  return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho^{1.225}";
var getPublicationMultiplier = (tau) => tau.pow(0.521) / BigNumber.from(2048).sqrt();
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.521}}{\\sqrt{2048}}";
var getTau = () => currency.value.pow(1.225);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getC2 = (level) => Utils.getStepwisePowerSum(level, 6, 36, 1).sqrt();
var getQ1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 1);
var getQ2 = (level) => Utils.getStepwisePowerSum(level, 2, 15, 1);
var getQ1Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC1Exponent = (level) => BigNumber.from(1 + 0.1 * level);

init();