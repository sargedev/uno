
enum CardType {
    Number,
    Color,
    Skip,
    Reverse,
    PlusTwo,
    PlusFour
}

enum CardColor {
    Red,
    Blue,
    Yellow,
    Green
}

function getCardImage(type: CardType, value?: number): Image {
    switch (type) {
        case CardType.Color: return assets.image`color`;
        case CardType.Skip: return assets.image`skip`;
        case CardType.Reverse: return assets.image`reverse`;
        case CardType.PlusTwo: return assets.image`plusTwo`;
        case CardType.PlusFour: return assets.image`plusFour`;
    }

    switch (value) {
        case 0: return assets.image`0`;
        case 1: return assets.image`1`;
        case 2: return assets.image`2`;
        case 3: return assets.image`3`;
        case 4: return assets.image`4`;
        case 5: return assets.image`5`;
        case 6: return assets.image`6`;
        case 7: return assets.image`7`;
        case 8: return assets.image`8`;
        case 9: return assets.image`9`;
    }

    throw "Asset not found";
}

class Card {
    type: CardType;
    color?: CardColor;
    value?: number;

    constructor(type: CardType, color?: CardColor, value?: number) {
        this.type = type;
        this.color = color;
        this.value = value;
    }

    render(): Sprite {
        let picture = getCardImage(this.type, this.value);
        
        if (this.color === CardColor.Blue) {
            picture.replace(1, 8);
            picture.replace(2, 9);
            picture.replace(3, 10);
            picture.replace(4, 11);
        } else if (this.color === CardColor.Yellow) {
            picture.replace(4, 12);
            picture.replace(3, 4);
            picture.replace(2, 3);
            picture.replace(1, 2);
        } else if (this.color === CardColor.Green) {
            picture.replace(1, 8);
            picture.replace(2, 7);
            picture.replace(3, 6);
            picture.replace(4, 5);
        }

        return sprites.create(picture);
    }

    toString(): string {
        let result = this.type.toString();
        result += this.color !== undefined ? `:${this.color}` : "";
        result += this.value !== undefined ? `:${this.value}` : "";
        return result;
    }
}

function addNumberCards(color: CardColor): Card[] {
    let result: Card[] = [new Card(CardType.Number, color, 0)];
    for (let i = 0; i < 9; i++) {
        arrays.concat(result, arrays.repeat(new Card(CardType.Number, color, i+1), 2));
    }
    return result;
}

function addSpecialCards(color: CardColor): Card[] {
    let result = arrays.concatMany([
        arrays.repeat(new Card(CardType.Skip, color), 2),
        arrays.repeat(new Card(CardType.Reverse, color), 2),
        arrays.repeat(new Card(CardType.PlusTwo, color), 2)
    ])
    return result;
}

function addWildCards(): Card[] {
    let result = arrays.concatMany([
        arrays.repeat(new Card(CardType.Color), 4),
        arrays.repeat(new Card(CardType.PlusFour), 4)
    ])
    return result;
}

function addAllColors(method: (color: CardColor) => Card[]): Card[] {
    return arrays.concatMany([
        method(CardColor.Red),
        method(CardColor.Blue),
        method(CardColor.Yellow),
        method(CardColor.Green),
    ])
}

let deck: Card[] = arrays.concatMany([
    addAllColors((color) => addNumberCards(color)),
    addAllColors((color) => addSpecialCards(color)),
    addWildCards()
])

console.log(deck);