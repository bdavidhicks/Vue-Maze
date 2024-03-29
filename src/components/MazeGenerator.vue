<template>
  <div>
    <h1>Maze Generator</h1>
    <div class="container">
      <div class="row mt-3">
        <div class="col mb-3">
          <form class="form-inline justify-content-center">
            <button class="btn btn-warning" @click.prevent="createMaze">Create Maze Instantly</button>
            <button class="btn btn-primary" @click.prevent="createMazeInSteps">Create Maze In Steps</button>
            <button class="btn btn-danger" :disabled="state === 'reset'" @click.prevent="resetMaze">Reset Maze</button>
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Cell Size" :value="cellSize" @input="cellSizeInput">
              <div class="input-group-append">
                <span class="input-group-text">px</span>
              </div>
            </div>
            <button class="btn btn-primary" v-if="state === 'created'" @click.prevent="solveMaze">Solve Maze Instantly</button>
            <button class="btn btn-success" v-if="state === 'created'" @click.prevent="solveMazeInSteps">Solve Maze In Steps</button>
            <button class="btn btn-danger" v-if="state === 'solved' || state === 'solving'" @click.prevent="clearSolution">Clear Solution</button>
          </form>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center" v-for="(row, rowIdx) in cells" :key="rowIdx">
        <app-cell class="d-flex" v-for="(cell, colIdx) in row" :key="colIdx" :cell="cell" :size="cellSize" :duration="duration" :borderWidth="borderWidth" :color="cellColor" :borderColor="cellBorderColor" :visitedColor="cellVisitedColor" :pathColor="cellPathColor"></app-cell>
      </div>
    </div>
  </div>
</template>

<script>
import Cell from './Cell.vue';

export default {
  components: {
    appCell: Cell,
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      cells: [],
      mazeWidth: null,
      mazeHeight: null,
      cellSize: 40,
      stepTime: 1,
      timeout: null,
      padding: 200,
      duration: 500,
      borderWidth: 8,
      debounce: null,
      cellColor: 'lightgray',
      cellVisitedColor: 'darkred',
      cellPathColor: 'green',
      cellBorderColor: 'black',
      state: 'reset',
      path: [],
    };
  },
  methods: {
    cellSizeInput(event) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        if (!Number.isNaN(event.target.value) && Number(event.target.value) >= 10) {
          this.cellSize = Number(event.target.value);
          this.resetMaze();
        }
      }, 600);
    },
    clearSolution() {
      clearTimeout(this.timeout);
      this.cells.forEach((row) => row.forEach((c) => {
        const cell = c;
        cell.visited = false;
        cell.isPath = false;
      }));
      this.path = [];
      this.state = 'created';
    },
    solveMaze() {
      this.state = 'solving';
      this.path = [];
      let c = this.cells.flatMap((row) => row).filter((cell) => cell.start)[0];
      while (!c.end) {
        c.visited = true;
        const neighbors = this.getUnvisitedNeighbors(c);
        const directions = Object.keys(neighbors).filter((key) => !c.walls[key]); //eslint-disable-line
        if (directions.length > 0) {
          this.path.push({ row: c.row, col: c.col });
          c.isPath = true;
          const direction = directions[Math.floor(Math.random() * directions.length)];
          c = neighbors[direction];
        } else {
          c.isPath = false;
          const prev = this.path.pop();
          c = this.cells[prev.row][prev.col];
        }
      }
      this.path.push({ row: c.row, col: c.col });
      c.visited = true;
      c.isPath = true;
      this.state = 'solved';
    },
    solveMazeInSteps() {
      const c = this.cells.flatMap((row) => row).filter((cell) => cell.start)[0];
      this.path = [];
      if (this.stepTime > 0) {
        this.timeout = setTimeout(() => this.solveMazeNextStep(c), this.stepTime);
      } else {
        this.solveMazeNextStep(c);
      }
      this.state = 'solving';
    },
    solveMazeNextStep(cell) {
      let c = cell;
      c.visited = true;
      c.isPath = true;
      const neighbors = this.getUnvisitedNeighbors(c);
      const directions = Object.keys(neighbors).filter((key) => !c.walls[key]); //eslint-disable-line
      if (directions.length > 0) {
        this.path.push({ row: c.row, col: c.col });
        c.isPath = true;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        c = neighbors[direction];
      } else {
        c.isPath = false;
        const prev = this.path.pop();
        c = this.cells[prev.row][prev.col];
      }
      if (!c.end) {
        if (this.stepTime > 0) {
          this.timeout = setTimeout(() => this.solveMazeNextStep(c), this.stepTime);
        } else {
          this.solveMazeNextStep(c);
        }
      } else {
        this.path.push({ row: c.row, col: c.col });
        c.visited = true;
        c.isPath = true;
        this.state = 'solved';
      }
    },
    resetMaze() {
      clearTimeout(this.timeout);
      this.path = [];
      this.mazeHeight = Math.floor((this.windowHeight - this.padding) / this.cellSize);
      this.mazeWidth = Math.floor((this.windowWidth - this.padding) / this.cellSize);
      const newCells = [];
      for (let r = 0; r < this.mazeHeight; r += 1) {
        const newRow = [];
        for (let c = 0; c < this.mazeWidth; c += 1) {
          newRow.push({
            visited: false,
            start: r === 0 && c === 0,
            end: r === this.mazeHeight - 1 && c === this.mazeWidth - 1,
            row: r,
            col: c,
            isPath: false,
            walls: {
              north: r !== 0 || c !== 0,
              east: true,
              south: r !== this.mazeHeight - 1 || c !== this.mazeWidth - 1,
              west: true,
            },
            edge: {
              top: r === 0,
              bottom: r === this.mazeHeight - 1,
              left: c === 0,
              right: c === this.mazeWidth - 1,
            },
          });
        }
        newCells.push(newRow);
      }
      this.cells = newCells;
      this.clearSolution();
      this.state = 'reset';
    },
    createMazeInSteps() {
      this.resetMaze();
      this.state = 'creating';
      this.cells[0][0].visited = true;
      this.createMazeNextStep(this.cells[0][0]);
    },
    createMazeNextStep(cell) {
      let c = cell;
      const neighbors = this.getUnvisitedNeighbors(c);
      if (Object.keys(neighbors).length > 0) {
        const direction = Object.keys(neighbors)[Math.floor(Math.random() * Object.keys(neighbors).length)];
        if (direction === 'north') {
          c.walls.north = false;
          neighbors[direction].walls.south = false;
        } else if (direction === 'east') {
          c.walls.east = false;
          neighbors[direction].walls.west = false;
        } else if (direction === 'south') {
          c.walls.south = false;
          neighbors[direction].walls.north = false;
        } else if (direction === 'west') {
          c.walls.west = false;
          neighbors[direction].walls.east = false;
        }
        c = neighbors[direction];
        c.visited = true;
        if (this.stepTime > 0) {
          this.timeout = setTimeout(() => this.createMazeNextStep(c), this.stepTime);
        } else {
          this.createMazeNextStep(c);
        }
      } else if (this.cells.flatMap((row) => row.some((item) => !item.visited)).some((value) => value)) {
        const visitedChoices = this.cells.flatMap((row) => row.filter((item) => item.visited && Object.keys(this.getUnvisitedNeighbors(item)).length > 0));
        c = visitedChoices[Math.floor(Math.random() * visitedChoices.length)];
        c.visited = true;
        if (this.stepTime > 0) {
          this.timeout = setTimeout(() => this.createMazeNextStep(c), this.stepTime);
        } else {
          this.createMazeNextStep(c);
        }
      } else {
        this.timeout = setTimeout(() => this.cells.forEach((row) => row.forEach((item) => item.visited = false), this.state = 'created'), this.duration); // eslint-disable-line
      }
    },
    createMaze() {
      this.resetMaze();
      this.state = 'creating';
      let c = this.cells[0][0];
      let neighbors = this.getUnvisitedNeighbors(c);
      c.visited = true;
      while (this.cells.flatMap((row) => row.some((cell) => !cell.visited)).some((value) => value)) {
        const visitedChoices = this.cells.flatMap((row) => row.filter((cell) => cell.visited && Object.keys(this.getUnvisitedNeighbors(cell)).length > 0));
        c = visitedChoices[Math.floor(Math.random() * visitedChoices.length)];
        neighbors = this.getUnvisitedNeighbors(c);
        c.visited = true;
        while (Object.keys(neighbors).length > 0) {
          const direction = Object.keys(neighbors)[Math.floor(Math.random() * Object.keys(neighbors).length)];
          if (direction === 'north') {
            c.walls.north = false;
            neighbors[direction].walls.south = false;
          } else if (direction === 'east') {
            c.walls.east = false;
            neighbors[direction].walls.west = false;
          } else if (direction === 'south') {
            c.walls.south = false;
            neighbors[direction].walls.north = false;
          } else if (direction === 'west') {
            c.walls.west = false;
            neighbors[direction].walls.east = false;
          }
          c = neighbors[direction];
          neighbors = this.getUnvisitedNeighbors(c);
          c.visited = true;
        }
      }
      this.cells.forEach((row) => row.forEach((item) => item.visited = false)); // eslint-disable-line
      this.state = 'created';
    },
    getUnvisitedNeighbors(cell) {
      const neighbors = {};
      if (cell.row > 0 && !this.cells[cell.row - 1][cell.col].visited) {
        neighbors.north = this.cells[cell.row - 1][cell.col];
      }
      if (cell.row < this.mazeHeight - 1 && !this.cells[cell.row + 1][cell.col].visited) {
        neighbors.south = this.cells[cell.row + 1][cell.col];
      }
      if (cell.col > 0 && !this.cells[cell.row][cell.col - 1].visited) {
        neighbors.west = this.cells[cell.row][cell.col - 1];
      }
      if (cell.col < this.mazeWidth - 1 && !this.cells[cell.row][cell.col + 1].visited) {
        neighbors.east = this.cells[cell.row][cell.col + 1];
      }
      return neighbors;
    },
    onResize() {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
      this.resetMaze();
    },
  },
  computed: {
    containerStyle() {
      return {
        'padding-left': `${Math.floor((this.windowWidth - this.mazeWidth * this.cellSize) / 2)}px`,
        'padding-top': `${Math.max(0, Math.floor((this.windowHeight - this.mazeHeight * this.cellSize - 225) / 2))}px`,
      };
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    });
    this.resetMaze();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
};
</script>

<style scoped>

</style>
