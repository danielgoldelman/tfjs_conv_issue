import tf from "@tensorflow/tfjs";
import { BertTokenizer } from "./index.js";

// const path =
//   "https://raw.githubusercontent.com/privacy-tech-lab/privacy-pioneer-machine-learning/main/convertMultiModel/multitaskModelForJSWeb/model.json";

/**
 * @type {tf.GraphModel} 
 */
let model;
/**
 * @type {BertTokenizer}
 */
let tokenizer;

/**
 * useModel is the function that takes in a string as input and return the bool of whether this is a true or false positive
 * @param {String} input The input string
 * @param {tf.GraphModel} model For use in testing
 * @returns {Promise<boolean>} boolean
 */
export async function useModel(input, model) {
  if (!tokenizer) {
    tokenizer = new BertTokenizer(true);
  }
  var tokens = await tokenizer.tokenize(input);
  const tLen = tokens.length;
  var attArr = [];
  if (tLen < 384) {
    for (var i = 0; i < tLen; i++) {
      attArr.push(1);
    }
    for (var i = 0; i < 384 - tLen; i++) {
      tokens.push(0);
      attArr.push(0);
    }
  } else if (tLen > 384) {
    tokens = tokens.slice(0, 384);
    for (var i = 0; i < 384; i++) {
      attArr.push(1);
    }
  } else {
    for (var i = 0; i < 384; i++) {
      attArr.push(1);
    }
  }

  const tensor = tf.tensor(tokens, [1, 384], "int32");
  const att = tf.tensor(attArr, [1, 384], "int32");
  const pred = await model.predict([att, tensor]);
  //@ts-ignore
  const retSoft = await tf.softmax(pred).array();
  const tfresults = retSoft[0];
  return tfresults[0] < tfresults[1];
}