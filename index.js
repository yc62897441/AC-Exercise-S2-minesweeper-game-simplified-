const symbols = [
  'icons8-bomb-64.png',  // 地雷
  'icons8-flag-60.png',  // 旗子
]

const GAME_STATE = {
  gameWaitToStart: "gameWaitToStart",
  gamePlaying: "gamePlaying",
  gameEnd: "gameEnd",
}

// const
const tbody = document.querySelector("#tbody")
const header = document.querySelector("#header")

const view = {
  // 設置格子，並編號data-index
  displayFields(rows, columns) {
    const tbody = document.querySelector("#tbody")
    let innerHTML = ``
    for (let i = 0; i < rows; i++) {
      innerHTML += `<tr>`
      for (let j = 0; j < columns; j++) {
        innerHTML += `<td class="unrevealed" data-index="${i}-${j}" data-nearbyMines=""></td>`
      }
      innerHTML += `</tr>`
    }
    tbody.innerHTML = innerHTML
  },

  // 設置地雷，並設定classList "mine"
  displayMines(mines, rows, columns) {
    const tbody = document.querySelector("#tbody")
    let i = 0
    while (i < mines) {
      // 隨機生成 row 與 column
      let row = Math.floor(Math.random() * rows)
      let column = Math.floor(Math.random() * columns)

      // 確認該 row 與 column 的格子還沒設置地雷，則在該格子設置地雷
      if (!tbody.children[row].children[column].classList.contains("mine")) {
        tbody.children[row].children[column].classList.add("mine")
        // model.mines.push(tbody.children[row].children[column].dataset.index)
        i++
      }
    }
  },

  // 計算每個格子，其周遭的地雷數量
  displayMinesAmount(rows, columns) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        let minesAmount = 0
        // 確認該格子沒有設置地雷，則計算該格子附近的地雷數量，並儲存至data-nearbyMines
        if (!tbody.children[row].children[column].classList.contains("mine")) {
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              try {
                if (tbody.children[row + i].children[column + j].classList.contains("mine")) {
                  minesAmount++
                }
              } catch { }
            }
          }
          tbody.children[row].children[column].dataset.nearbyMines = minesAmount
        }
      }
    }
  },

  // 插旗or移除插旗
  set_remove_flag(event) {
    // 點選格子，可set或remove旗子
    if (event.target.tagName === "TD") {
      if (event.target.classList.contains("unrevealed")) {
        // 點選格子，set flag
        event.target.classList.remove("unrevealed")
        event.target.classList.add("flag")
        event.target.innerHTML = `<img class="flag" src="${symbols[1]}" alt="">`
        model.remainMines(-1)
      } else if (event.target.classList.contains("flag")) {
        // 點選格子，remove flag
        event.target.classList.remove("flag")
        event.target.classList.add("unrevealed")
        event.target.innerHTML = ``
        model.remainMines(1)
      }
    }

    // 已經有插旗的狀況，右鍵旗子可以remove旗子
    if ((event.target.tagName === "IMG") && (event.target.classList.contains("flag"))) {
      event.target.parentElement.classList.remove("flag")
      event.target.parentElement.classList.add("unrevealed")
      event.target.parentElement.innerHTML = ``
      model.remainMines(1)
    }
  },

  // 地雷爆炸
  mineExplode(event) {
    event.target.classList.add("revealed")
    event.target.classList.remove("unrevealed")
    event.target.innerHTML = `<img class="mine" src="${symbols[0]}" alt="">`
    setTimeout(function () {
      window.alert("You lose!")
    }, 100)
  },

  // 顯示該格子周遭地雷數量
  showFieldContent(event) {
    if (event.target.classList.contains("unrevealed")) {
      event.target.classList.add("revealed")
      event.target.classList.remove("unrevealed")
      event.target.innerHTML = `${event.target.dataset.nearbyMines}`
    }
  },

  // 顯示剩餘地雷數量
  showRemainMines(amount) {
    let minesAmount = document.querySelector(".minesAmount")
    minesAmount.children[1].innerHTML = amount
  },

  // Game Win 遊戲結束
  gameWin() {
    controller.currentState = GAME_STATE.gameEnd
    setTimeout(function () {
      window.alert("You win!")
    }, 100)
  },
}

const controller = {
  currentState: GAME_STATE.gameWaitToStart,

  /**
   * createGame()
   * 根據參數，顯示遊戲版圖行列
   * 根據參數，埋設地雷
   * 根據地雷埋設位置，計算每個格子周遭的地雷數
   * 顯示剩餘地雷數量於info
   */
  createGame(mines, rows, columns) {
    view.displayFields(rows, columns)
    view.displayMines(mines, rows, columns)
    view.displayMinesAmount(rows, columns)
    view.showRemainMines(mines)
  },

  restartGame() {
    this.currentState = GAME_STATE.gameWaitToStart
    model.reveal = 0
    this.createGame(model.mines, model.rows, model.columns)
  },
}

const model = {
  // 地雷數、列述、行數、未點開格子數
  mines: 10,
  rows: 8,
  columns: 8,
  reveal: 0,

  // 計算剩餘地雷數量，並顯示在info
  remainMines(count) {
    let minesAmount = document.querySelector(".minesAmount")
    let amount = Number(minesAmount.children[1].innerHTML) + count
    view.showRemainMines(amount)
  },
}

// 開啟網頁，先設置遊戲
controller.createGame(model.mines, model.rows, model.columns)

// 重新設置遊戲
header.addEventListener("click", function (event) {
  if (event.target.classList.contains("start")) {
    controller.restartGame()
  }
})

// 左鍵點選格子，開始遊戲 
tbody.addEventListener("click", function (event) {
  if (event.target.tagName === "TD") {
    // currentState 切換到 gamePlaying
    if (controller.currentState === "gameWaitToStart") {
      controller.currentState = GAME_STATE.gamePlaying
    }

    // 左鍵點格子判斷
    if (controller.currentState === "gamePlaying") {
      if ((event.target.classList.contains("mine")) && (!event.target.classList.contains("flag"))) {
        // 點到地雷
        view.mineExplode(event)
        controller.currentState = GAME_STATE.gameEnd
      } else if ((!event.target.classList.contains("mine")) && (!event.target.classList.contains("flag")) && (event.target.classList.contains("unrevealed"))) {
        // 點到未揭露的格子
        view.showFieldContent(event)
        model.reveal += 1

        if (model.reveal === (model.rows * model.columns - model.mines)) {
          view.gameWin()
        }
      }
    }
  }
})

// 右鍵 set_remove_flag
tbody.addEventListener('contextmenu', function (event) {
  event.preventDefault()
  if (controller.currentState === "gamePlaying") {
    view.set_remove_flag(event)
  }
})