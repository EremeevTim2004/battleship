import "./style.css";

const messages = {
  init: "Drag your ships to the map.",
  start: "Please click start to proceed",
  "your turn": "Your turn! Find and destroy all five enemy ships",
  won: "You won!!",
  lost: "Tough luck!! Computer won!",
  hit: "Boom, enemy ship is hit",
  miss: "Oops, nothing there",
  "already hit": "This cell is already hit. Try a new target",
  computer: "Computer thinking...",
  "computer hit": "Computer hit your ship",
  "computer miss": "Computer missed",
  destroyer: "A destroyer is sunk!",
  submarine: "A submarine is sunk!",
  cruiser: "A cruiser is sunk!",
  battleship: "A battleship is sunk!",
  career: "A career is sunk!",
};

const messageContainer = document.getElementById("message") as HTMLElement;
const changeMessage = (newText: string) => {
  messageContainer.style.opacity = "0";

  setTimeout(() => {
    messageContainer.innerHTML = newText;
    messageContainer.style.opacity = "1";
  }, 250);
};
changeMessage(messages.init);

// Rotate options
let isFlipped = false;
const rotate = () => {
  const shipsHolder = document.getElementById("ships")!;
  const ships = [...shipsHolder.children] as HTMLElement[];

  if (!isFlipped) {
    ships.forEach((ship) => ship.classList.add("rotated"));
  } else {
    ships.forEach((ship) => ship.classList.remove("rotated"));
  }
  isFlipped = !isFlipped;
};

document.getElementById("rotate")!.addEventListener("click", rotate);

// Board
const createGrid = (element: HTMLElement) => {
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${i}`;
    element.append(cell);
  }
};
const playerBoard = document.getElementById("player")!;
createGrid(playerBoard);
const computerBoard = document.getElementById("computer")!;
createGrid(computerBoard);

// Ship Class
class Ship {
  name: string;
  size: number;
  constructor(_name: string, _size: number) {
    this.name = _name;
    this.size = _size;
  }
}

// Enemy Ships
const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const career = new Ship("career", 5);

const allShips = [destroyer, submarine, cruiser, battleship, career];

const getShipCells = (
  size: number,
  x: number,
  y: number,
  isFlipped: boolean,
  player: string
) => {
  const board = player === "computer" ? computerBoard : playerBoard;

  const cells = Array.from(
    board.getElementsByClassName("cell")
  ) as HTMLElement[];

  const spots = new Array(size)
    .fill(-1)
    .map((_, i) => {
      if (isFlipped) {
        return x * 10 + y + i * 10;
      } else {
        return x * 10 + y + i;
      }
    })
    .map((i) => cells[i]);
  return spots;
};

const addShipToGrid = (ship: Ship) => {
  while (true) {
    const isFlipped = Math.random() < 0.5;
    const y = isFlipped
      ? Math.floor(Math.random() * 10)
      : Math.floor(Math.random() * (10 - ship.size));
    const x = isFlipped
      ? Math.floor(Math.random() * (10 - ship.size))
      : Math.floor(Math.random() * 10);

    const spots = getShipCells(ship.size, x, y, isFlipped, "computer");

    if (spots.every((spot) => !spot.classList.contains("taken"))) {
      spots.forEach((spot) => spot.classList.add("taken", ship.name));
      break;
    }
  }
};
allShips.forEach((ship) => addShipToGrid(ship));

// Drag Ships
const myCells = Array.from(
  playerBoard.getElementsByClassName("cell")
) as HTMLElement[];
const draggableShips = Array.from(
  document.querySelectorAll("#ships div")
) as HTMLElement[];
const computerCells = Array.from(
  computerBoard.getElementsByClassName("cell")
) as HTMLElement[];

let draggingShip: string = "";

const checkValidDropTarget = (id: number) => {
  const size = allShips.find((ship) => ship.name === draggingShip)?.size || 0;
  const x = Math.floor(id / 10);
  const y = id - x * 10;

  const cells = getShipCells(size, x, y, isFlipped, "player");
  if (cells.some((cell) => cell && cell.classList.contains("taken")))
    return false;

  if (!isFlipped) {
    if (size + y > 10) return false;
    else return true;
  } else {
    if (size + x > 10) return false;
    else return true;
  }
};

const highlightCells = (id: number) => {
  const size = allShips.find((ship) => ship.name === draggingShip)?.size || 0;
  const x = Math.floor(id / 10);
  const y = id - x * 10;
  const validCells = getShipCells(size, x, y, isFlipped, "player");
  validCells.forEach((cell) => {
    cell.classList.add("highlight");
  });
};

const onDragStart = (e: MouseEvent) => {
  draggingShip = (e.target as HTMLElement).classList[0];
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  const targetID = (e.target as HTMLElement).id;
  const id = Number(targetID.split("cell-")[1]);
  const isValidDrop = checkValidDropTarget(id);
  if (isValidDrop) {
    highlightCells(id);
  }
};
const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  myCells.forEach((cell) => {
    cell.classList.remove("highlight");
  });
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();

  const highlightedCells = myCells.filter((cell) => {
    return cell.classList.contains("highlight");
  });

  if (highlightedCells.length === 0) return;

  myCells.forEach((cell) => {
    if (cell.classList.contains("highlight")) {
      cell.classList.remove("highlight");
      cell.classList.add("taken");
      cell.classList.add(draggingShip);
    }
  });

  const index = draggableShips.findIndex((ship) =>
    ship.classList.contains(draggingShip)
  );
  if (index !== -1) {
    draggableShips[index].remove(); // Remove the element from the DOM
    draggableShips.splice(index, 1); // Remove the element from the array
  }

  if (draggableShips.length === 0) {
    document.getElementById("rotate")?.removeEventListener("click", rotate);
    document.getElementById("rotate")?.setAttribute("disabled", "true");
    document.getElementById("start")?.removeAttribute("disabled");
    changeMessage(messages.start);
  }
};

myCells.forEach((cell) => {
  cell.addEventListener("dragover", onDragOver);
  cell.addEventListener("dragleave", onDragLeave);
  cell.addEventListener("drop", onDrop);
});

draggableShips.forEach((ship) => {
  ship.addEventListener("dragstart", onDragStart);
});

// Game stats
let gameOver: boolean = false;
let turn: "player" | "computer" = "computer";
const playerHits: string[] = [];
const computerHits: string[] = [];

const playerSunkShips: string[] = [];
const computerSunkShips: string[] = [];

const checkGameOver = () => {
  if (playerSunkShips.length === 5) {
    changeMessage(messages.won);
    gameOver = true;
    return;
  }
  if (computerSunkShips.length === 5) {
    changeMessage(messages.lost);
    gameOver = true;
    return;
  }
};

const getPriorityTargets = () => {
  const hits = myCells
    .filter((cell) => cell.classList.contains("hit"))
    .filter((cell) => {
      const shipRegex = /cell taken (.+?) hit/;
      const match = cell.classList.toString().match(shipRegex);
      const ship = match?.[1] || "";
      return !computerSunkShips.includes(ship);
    });

  const candidateIDs = new Set();
  hits.forEach((cell) => {
    const id = Number(cell.id.split("cell-")[1]);
    if (id % 10 !== 0) candidateIDs.add(id - 1);
    if (id % 10 !== 9) candidateIDs.add(id + 1);
    if (id > 9) candidateIDs.add(id - 10);
    if (id < 90) candidateIDs.add(id + 10);
  });

  const validOnes = [...candidateIDs]
    .map((id) => myCells.find((div) => div.id === `cell-${id}`))
    .filter(
      (cell) =>
        !cell?.classList.contains("hit") && !cell?.classList.contains("miss")
    );

  return validOnes as HTMLElement[];
};

const computerTurn = () => {
  checkGameOver();

  if (gameOver) return;

  changeMessage(messages.computer);
  setTimeout(() => {
    const priorityTargets = getPriorityTargets();
    let target;

    if (priorityTargets.length) {
      target =
        priorityTargets[Math.floor(Math.random() * priorityTargets.length)];
    } else {
      const validTargets = myCells.filter(
        (cell) =>
          !cell.classList.contains("miss") && !cell.classList.contains("hit")
      );
      target = validTargets[Math.floor(Math.random() * validTargets.length)];
    }

    if (target.classList.contains("taken")) {
      const shipType = target.classList.toString().split("cell taken ")[1];
      computerHits.push(shipType);

      target.classList.add("hit");
      if (checkSunkShip(shipType)) {
        changeMessage(messages[shipType as keyof typeof messages]);
      } else {
        changeMessage(messages["computer hit"]);
      }
    } else {
      changeMessage(messages["computer miss"]);
      target.classList.add("miss");
    }
  }, 750);

  setTimeout(() => {
    checkGameOver();
    if (gameOver) {
      return;
    }
    changeMessage(messages["your turn"]);
    turn = "player";
  }, 1500);
};

const checkSunkShip = (shipType: string) => {
  const size = allShips.find((ship) => ship.name === shipType)!.size;
  const sunkSize =
    turn === "player"
      ? playerHits.filter((hit) => hit === shipType).length
      : computerHits.filter((hit) => hit === shipType).length;

  if (size === sunkSize) {
    turn === "player"
      ? playerSunkShips.push(shipType)
      : computerSunkShips.push(shipType);

    return true;
  }
  return false;
};

const handlePlayerClick = (e: MouseEvent) => {
  checkGameOver();

  if (gameOver) return;

  if (turn === "player") {
    const target = e.target as HTMLElement;
    if (target.classList.contains("hit") || target.classList.contains("miss")) {
      changeMessage(messages["already hit"]);
      return;
    }
    if (target.classList.contains("taken")) {
      const shipType = target.classList.toString().split("cell taken ")[1];
      playerHits.push(shipType);
      target.classList.add("hit");
      if (checkSunkShip(shipType)) {
        changeMessage(messages[shipType as keyof typeof messages]);
      } else {
        changeMessage(messages.hit);
      }
    } else {
      target.classList.add("miss");
      changeMessage(messages.miss);
    }

    turn = "computer";

    setTimeout(computerTurn, 750);
  }
};

const startGame = () => {
  turn = "player";
  computerCells.forEach((cell) => {
    cell.addEventListener("click", handlePlayerClick);
  });
  document.getElementById("start")?.setAttribute("disabled", "true");
  changeMessage(messages["your turn"]);
};
document.getElementById("start")?.addEventListener("click", startGame);