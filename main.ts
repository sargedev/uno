
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

class Player {
    cards: Card[];

    constructor(cards: Card[]) {
        this.cards = cards;
    }
}

scene.setBackgroundColor(2);

let gameRules: {[key: string]: boolean} =  {
    stacking: true,
    multicolorStacking: true,
    twoOnTwo: true,
    fourOnTwo: true,
    twoOnFour: false,
    twoOnFourColor: false,
    playWhenDrawing: false,
    skipAnimation: false,
    onlyOneWinner: false,
    unlimitedDrawing: false
}

let mainMenu: miniMenu.MenuSprite;
let playerNum = 4;

function format(value: boolean): string {
    return value ? "ON" : "OFF";
}

function renderMainMenu(index?: number): void {
    if (mainMenu) mainMenu.destroy();

    mainMenu = miniMenu.createMenuFromArray([
        miniMenu.createMenuItem(`Start Game`),
        miniMenu.createMenuItem(`No. of players: ${playerNum}`),
        miniMenu.createMenuItem(`Stacking: ${format(gameRules.stacking)}`),
        miniMenu.createMenuItem(`Multicolor stacking: ${format(gameRules.multicolorStacking)}`),
        miniMenu.createMenuItem(`+2 on +2: ${format(gameRules.twoOnTwo)}`),
        miniMenu.createMenuItem(`+4 on +2: ${format(gameRules.fourOnTwo)}`),
        miniMenu.createMenuItem(`+2 on +4: ${format(gameRules.twoOnFour)}`),
        miniMenu.createMenuItem(`+2 on +4 (colored): ${format(gameRules.twoOnFourColor)}`),
        miniMenu.createMenuItem(`Play when drawing: ${format(gameRules.playWhenDrawing)}`),
        miniMenu.createMenuItem(`Skip dealing animation: ${format(gameRules.skipAnimation)}`),
        miniMenu.createMenuItem(`Only 1 winner: ${format(gameRules.onlyOneWinner)}`),
        miniMenu.createMenuItem(`Unlimited drawing: ${format(gameRules.unlimitedDrawing)}`)
    ])

    if (index) {
        for (let i = 0; i < index; i++) mainMenu.moveSelection(miniMenu.MoveDirection.Down);
    }

    mainMenu.onButtonPressed(controller.A, handleMainMenu);

    mainMenu.setMenuStyleProperty(miniMenu.MenuStyleProperty.Width, 140);
    mainMenu.setMenuStyleProperty(miniMenu.MenuStyleProperty.Height, 60);
    mainMenu.setPosition(80, 80);
}

function handleMainMenu(selection: string, selectedIndex: number): void {
    if (selectedIndex === 0) {
        mainMenu.close();
        startGame();
        return;
    } else if (selectedIndex === 1) {
        playerNum += 1;
        playerNum = (playerNum - 2) % 3 + 2;
    } else {
        let rule = Object.keys(gameRules)[selectedIndex - 2];
        gameRules[rule] = !gameRules[rule];
    }
    renderMainMenu(selectedIndex);
}

renderMainMenu();

let deckCard: Sprite;

function startGame() {
    createDeck();
}

let deck: Card[];

function createDeck() {
    deck = arrays.concatMany([
        addAllColors((color) => addNumberCards(color)),
        addAllColors((color) => addSpecialCards(color)),
        addWildCards()
    ])
    arrays.shuffle(deck);
    deckCard = sprites.create(assets.image`cardBack`);
}

/**
 * How many players (2-4)
 * Stacking
 * Multicolor stacking
 * Stacking at once
 * +2 stacking
 * +4 stacking
 * +4 on +2
 * +2 on +4
 * +2 on +4 (with color)
 * Play when drawing
 * Skip dealing animation
 * Play until 1 winner
 * Draw 1 or unlimited
 */