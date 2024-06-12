
enum CardType {
    Colored,
    Wild
}

enum CardColor {
    Red,
    Blue,
    Yellow,
    Green
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
}