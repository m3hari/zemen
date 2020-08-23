import {
  rdFromEthiopic,
  ethiopicFromRd,
  rdFromGeregorian,
  geregorianFromRd,
} from "./core";
import { SimpleDate } from "../@types";

export function ethiopicToGregorian(date: SimpleDate) {
  return geregorianFromRd(rdFromEthiopic(date));
}

export function gregorianToEthiopic(date: SimpleDate) {
  return ethiopicFromRd(rdFromGeregorian(date));
}
