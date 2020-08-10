<template>
  <div>
    <h1>Map Generator</h1>
    <div class="container">
      <div class="row mt-3">
        <div class="col mb-3">
          <form class="form-inline justify-content-center">
            <button class="btn btn-warning" @click.prevent="createMap">Create Map Instantly</button>
            <button class="btn btn-primary" @click.prevent="createMapInSteps">Create Map In Steps</button>
            <button class="btn btn-danger" :disabled="state === 'reset'" @click.prevent="resetMap">Reset Map</button>
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Cell Size" :value="cellSize" @input="cellSizeInput">
              <div class="input-group-append">
                <span class="input-group-text">px</span>
              </div>
            </div>
            <button class="btn btn-primary" v-if="state === 'created'" @click.prevent="solveMap">Solve Map Instantly</button>
            <button class="btn btn-success" v-if="state === 'created'" @click.prevent="solveMapInSteps">Solve Map In Steps</button>
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
      mapWidth: null,
      mapHeight: null,
      cellSize: 60,
      stepTime: 5,
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
        if (!Number.isNaN(event.target.value) && Number(event.target.value) > 10) {
          this.cellSize = Number(event.target.value);
          this.resetMap();
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
    solveMap() {
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
    solveMapInSteps() {
      const c = this.cells.flatMap((row) => row).filter((cell) => cell.start)[0];
      this.path = [];
      this.timeout = setTimeout(() => this.solveMapNextStep(c), this.stepTime);
      this.state = 'solving';
    },
    solveMapNextStep(cell) {
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
        this.timeout = setTimeout(() => this.solveMapNextStep(c), this.stepTime);
      } else {
        this.path.push({ row: c.row, col: c.col });
        c.visited = true;
        c.isPath = true;
        this.state = 'solved';
      }
    },
    resetMap() {
      clearTimeout(this.timeout);
      this.path = [];
      this.mapHeight = Math.floor((this.windowHeight - this.padding) / this.cellSize);
      this.mapWidth = Math.floor((this.windowWidth - this.padding) / this.cellSize);
      const newCells = [];
      for (let r = 0; r < this.mapHeight; r += 1) {
        const newRow = [];
        for (let c = 0; c < this.mapWidth; c += 1) {
          newRow.push({
            visited: false,
            start: r === 0 && c === 0,
            end: r === this.mapHeight - 1 && c === this.mapWidth - 1,
            row: r,
            col: c,
            isPath: false,
            walls: {
              north: r !== 0 || c !== 0,
              east: true,
              south: r !== this.mapHeight - 1 || c !== this.mapWidth - 1,
              west: true,
            },
            edge: {
              top: r === 0,
              bottom: r === this.mapHeight - 1,
              left: c === 0,
              right: c === this.mapWidth - 1,
            },
          });
        }
        newCells.push(newRow);
      }
      this.cells = newCells;
      this.clearSolution();
      this.state = 'reset';
    },
    createMapInSteps() {
      this.resetMap();
      this.state = 'creating';
      this.cells[0][0].visited = true;
      this.createMapNextStep(this.cells[0][0]);
    },
    createMapNextStep(cell) {
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
        this.timeout = setTimeout(() => this.createMapNextStep(c), this.stepTime);
      } else if (this.cells.flatMap((row) => row.some((item) => !item.visited)).some((value) => value)) {
        const visitedChoices = this.cells.flatMap((row) => row.filter((item) => item.visited && Object.keys(this.getUnvisitedNeighbors(item)).length > 0));
        c = visitedChoices[Math.floor(Math.random() * visitedChoices.length)];
        c.visited = true;
        this.timeout = setTimeout(() => this.createMapNextStep(c), this.stepTime);
      } else {
        this.timeout = setTimeout(() => this.cells.forEach((row) => row.forEach((item) => item.visited = false), this.state = 'created'), this.duration); // eslint-disable-line
      }
    },
    createMap() {
      this.resetMap();
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
      if (cell.row < this.mapHeight - 1 && !this.cells[cell.row + 1][cell.col].visited) {
        neighbors.south = this.cells[cell.row + 1][cell.col];
      }
      if (cell.col > 0 && !this.cells[cell.row][cell.col - 1].visited) {
        neighbors.west = this.cells[cell.row][cell.col - 1];
      }
      if (cell.col < this.mapWidth - 1 && !this.cells[cell.row][cell.col + 1].visited) {
        neighbors.east = this.cells[cell.row][cell.col + 1];
      }
      return neighbors;
    },
    onResize() {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
      this.resetMap();
    },
  },
  computed: {
    containerStyle() {
      return {
        'padding-left': `${Math.floor((this.windowWidth - this.mapWidth * this.cellSize) / 2)}px`,
        'padding-top': `${Math.max(0, Math.floor((this.windowHeight - this.mapHeight * this.cellSize - 225) / 2))}px`,
      };
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    });
    this.resetMap();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
};
</script>

<style scoped>

</style>
