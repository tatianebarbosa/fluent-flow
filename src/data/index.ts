import { animals } from "./animals";
import { body } from "./body";
import { clothes } from "./clothes";
import { colors } from "./colors";
import { emotions } from "./emotions";
import { fitness } from "./fitness";
import { food } from "./food";
import { house } from "./house";
import { numbers } from "./numbers";
import { phrases } from "./phrases";
import { restaurant } from "./restaurant";
import { shopping } from "./shopping";
import { travel } from "./travel";
import { verbs } from "./verbs";
import { work } from "./work";

export const flowCategories = [
  numbers,
  colors,
  animals,
  food,
  house,
  clothes,
  body,
  verbs,
  shopping,
  restaurant,
  travel,
  work,
  emotions,
  fitness,
  phrases,
];

export const flowCategoryMap = Object.fromEntries(
  flowCategories.map((category) => [category.id, category]),
);
