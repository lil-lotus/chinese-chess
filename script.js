const workerCode = `
const COLOR={RED:'red',BLACK:'black'};
const BASE_SCORE={k:10000,r:90,c:45,h:40,e:20,a:20,s:10};
const MVV_LVV={k:9000,r:90,c:45,h:40,e:20,a:20,s:10};
const POS_TABLE={
r:[[20,20,20,25,30,25,20,20,20],[15,15,15,20,25,20,15,15,15],[0,0,0,10,12,10,0,0,0],[0,0,0,10,12,10,0,0,0],[0,0,0,10,12,10,0,0,0],[0,0,0,10,12,10,0,0,0],[0,0,0,10,12,10,0,0,0],[0,0,0,10,12,10,0,0,0],[15,15,15,20,25,20,15,15,15],[20,20,20,25,30,25,20,20,20]],
h:[[0,0,0,0,0,0,0,0,0],[0,3,6,10,12,10,6,3,0],[2,5,8,12,15,12,8,5,2],[4,8,14,18,20,18,14,8,4],[6,10,16,22,24,22,16,10,6],[6,10,16,22,24,22,16,10,6],[4,8,14,18,20,18,14,8,4],[2,5,8,12,15,12,8,5,2],[0,3,6,10,12,10,6,3,0],[0,0,0,0,0,0,0,0,0]],
c:[[0,0,0,0,0,0,0,0,0],[0,2,4,6,8,6,4,2,0],[0,4,8,12,14,12,8,4,0],[2,6,10,16,18,16,10,6,2],[4,8,12,18,20,18,12,8,4],[4,8,12,18,20,18,12,8,4],[2,6,10,16,18,16,10,6,2],[0,4,8,12,14,12,8,4,0],[0,2,4,6,8,6,4,2,0],[0,0,0,0,0,0,0,0,0]],
s:[[0,0,0,0,0,0,0,0,0],[2,4,6,8,10,8,6,4,2],[4,6,8,12,14,12,8,6,4],[6,10,14,18,22,18,14,10,6],[10,14,20,26,30,26,20,14,10],[10,14,20,26,30,26,20,14,10],[6,10,14,18,22,18,14,10,6],[4,6,8,12,14,12,8,6,4],[2,4,6,8,10,8,6,4,2],[0,0,0,0,0,0,0,0,0]]
};
const TT_EXACT=0,TT_LOWER=1,TT_UPPER=2;
let tt=new Map();const TT_MAX=20000;let historyTable;let killerMoves;let timeDeadLine=0;
const openingBook={
"r,h,e,a,k,a,e,h,r,,c,,,c,s,s,s,s,s,,,,S,S,S,S,S,,C,,,C,,R,H,E,A,K,A,E,H,R":{fromR:2,fromC:1,toR:2,toC:4},
"r,h,e,a,k,a,e,h,r,,c,,,c,s,s,s,s,s,,,,S,S,S,S,S,,C,,,C,,R,H,E,A,K,A,E,H,R1":{fromR:2,fromC:7,toR:2,toC:4},
"r,h,e,a,k,a,e,h,r,,c,,,c,s,s,s,s,s,,,,S,S,S,S,S,,C,,,C,,R,H,E,A,K,A,E,H,R2":{fromR:0,fromC:1,toR:2,toC:2}
};
function copyBoard(b){return b.map(r=>[...r])}
function findKing(board,color){let tc=color===COLOR.RED?'K':'k';for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(board[r][c]===tc)return{r,c};return null}
function isKingFaceToFace(board){let rk=findKing(board,COLOR.RED),bk=findKing(board,COLOR.BLACK);if(!rk||!bk)return false;if(rk.c!==bk.c)return false;let mn=Math.min(rk.r,bk.r),mx=Math.max(rk.r,bk.r);for(let i=mn+1;i<mx;i++)if(board[i][rk.c])return false;return true}
function isInCheck(board,color){let kp=findKing(board,color);if(!kp)return true;let opp=color===COLOR.RED?COLOR.BLACK:COLOR.RED;let moves=getAllRawMoves(board,opp);for(let m of moves)if(m.toR===kp.r&&m.toC===kp.c)return true;if(isKingFaceToFace(board))return true;return false}
function getAllRawMoves(board,color){let moves=[];for(let r=0;r<10;r++){for(let c=0;c<9;c++){let p=board[r][c];if(!p)continue;let isRed=p===p.toUpperCase();if((color===COLOR.RED&&isRed)||(color===COLOR.BLACK&&!isRed)){let vm=getRawValid(r,c,board);vm.forEach(v=>moves.push({fromR:r,fromC:c,toR:v.r,toC:v.c}))}}}return moves}
function getRawValid(r,c,board){let p=board[r][c];if(!p)return[];let t=p.toLowerCase(),isRed=p===p.toUpperCase();let mv=[];const add=(tr,tc)=>{if(tr<0||tr>=10||tc<0||tc>=9)return;let tar=board[tr][tc];if(!tar||(isRed&&tar===tar.toLowerCase())||(!isRed&&tar===tar.toUpperCase()))mv.push({r:tr,c:tc})};
switch(t){
case'k':[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc;if(nc>=3&&nc<=5){if(isRed&&nr>=7&&nr<=9)add(nr,nc);if(!isRed&&nr>=0&&nr<=2)add(nr,nc)}});break;
case'a':[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc;if(nc>=3&&nc<=5){if(isRed&&nr>=7&&nr<=9)add(nr,nc);if(!isRed&&nr>=0&&nr<=2)add(nr,nc)}});break;
case'e':[[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc;if(isRed&&nr<5)return;if(!isRed&&nr>4)return;let er=r+dr/2,ec=c+dc/2;if(er>=0&&er<10&&ec>=0&&ec<9&&!board[er][ec])add(nr,nc)});break;
case'h':[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc;let lr=r,lc=c;if(Math.abs(dr)===2)lr+=dr/2;else lc+=dc/2;if(lr>=0&&lr<10&&lc>=0&&lc<9&&!board[lr][lc])add(nr,nc)});break;
case'r':[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc;while(nr>=0&&nr<10&&nc>=0&&nc<9){if(!board[nr][nc])mv.push({r:nr,c:nc});else{if((isRed&&board[nr][nc]===board[nr][nc].toLowerCase())||(!isRed&&board[nr][nc]===board[nr][nc].toUpperCase()))mv.push({r:nr,c:nc});break}nr+=dr;nc+=dc}});break;
case'c':[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{let nr=r+dr,nc=c+dc,jump=false;while(nr>=0&&nr<10&&nc>=0&&nc<9){if(!board[nr][nc]){if(!jump)mv.push({r:nr,c:nc})}else{if(!jump)jump=true;else{if((isRed&&board[nr][nc]===board[nr][nc].toLowerCase())||(!isRed&&board[nr][nc]===board[nr][nc].toUpperCase()))mv.push({r:nr,c:nc});break}}nr+=dr;nc+=dc}});break;
case's':let fwd=isRed?-1:1;add(r+fwd,c);if((isRed&&r<=4)||(!isRed&&r>=5)){add(r,c-1);add(r,c+1)}break;
}
return mv}
function scoreMove(board,mv,depth){let s=0;const cap=board[mv.toR][mv.toC];const piece=board[mv.fromR][mv.fromC];if(cap){s+=MVV_LVV[cap.toLowerCase()]*15-MVV_LVV[piece.toLowerCase()];if(cap.toLowerCase()==='k')s+=60000}let nb=copyBoard(board);nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;const opp=piece===piece.toUpperCase()?COLOR.BLACK:COLOR.RED;if(isInCheck(nb,opp))s+=2500;const hkey=mv.fromR*1000+mv.fromC*100+mv.toR*10+mv.toC;if(historyTable[hkey])s+=historyTable[hkey];if(killerMoves[depth]){for(const km of killerMoves[depth]){if(km.fromR===mv.fromR&&km.fromC===mv.fromC&&km.toR===mv.toR&&km.toC===mv.toC){s+=1200;break}}}return s}
function sortMoves(board,moves,depth){return moves.slice().sort((a,b)=>scoreMove(board,b,depth)-scoreMove(board,a,depth))}
function evaluateBoard(board){let score=0,pieces=0;for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(board[r][c])pieces++;const endGame=pieces<=12;if(isInCheck(board,COLOR.RED))score+=endGame?280:140;if(isInCheck(board,COLOR.BLACK))score-=endGame?280:140;for(let r=0;r<10;r++){for(let c=0;c<9;c++){let p=board[r][c];if(!p)continue;const typ=p.toLowerCase(),isRed=p===p.toUpperCase();let val=BASE_SCORE[typ],pos=0;if(POS_TABLE[typ])pos=isRed?POS_TABLE[typ][9-r][c]:POS_TABLE[typ][r][c];if(typ==='s'){if(isRed&&r<=4)pos+=35;if(!isRed&&r>=5)pos+=35;if(endGame)pos*=2.0}if(typ==='r'&&(c===4||c===5))pos+=12;let tot=val+pos;if(isRed)score-=tot;else score+=tot}}return score}
function boardHash(board){let h=0;for(let r=0;r<10;r++){for(let c=0;c<9;c++){let ch=board[r][c];let code=ch?ch.charCodeAt(0):0;h=((h<<5)-h)+code;h=h|0}}return h}
function storeTT(h,depth,score,flag,bestMove){if(tt.size>=TT_MAX)tt.delete(tt.keys().next().value);tt.set(h,{depth,score,flag,bestMove})}
function addKiller(depth,move){if(!killerMoves[depth])killerMoves[depth]=[];if(killerMoves[depth].length<2)killerMoves[depth].push(move)}
function minimax(board,depth,alpha,beta,isMax,isCheck){if(Date.now()>timeDeadLine){return evaluateBoard(board)}const h=boardHash(board);const ttEntry=tt.get(h);if(ttEntry&&ttEntry.depth>=depth){if(ttEntry.flag===TT_EXACT)return ttEntry.score;if(ttEntry.flag===TT_LOWER)alpha=Math.max(alpha,ttEntry.score);if(ttEntry.flag===TT_UPPER)beta=Math.min(beta,ttEntry.score);if(alpha>=beta)return ttEntry.score}if(depth<=0&&!isCheck){const curColor=isMax?COLOR.BLACK:COLOR.RED;if(isInCheck(board,curColor)){depth+=1}}if(depth<=0){const s=evaluateBoard(board);storeTT(h,0,s,TT_EXACT,null);return s}if(!isCheck&&depth>=3){const curColor=isMax?COLOR.BLACK:COLOR.RED;const opp=curColor===COLOR.RED?COLOR.BLACK:COLOR.RED;const nullScore=minimax(board,depth-3,-beta,-beta+1,!isMax,false);if(nullScore>=beta)return beta}let color=isMax?COLOR.BLACK:COLOR.RED;let raw=getAllRawMoves(board,color);let legal=[];for(let mv of raw){let nb=copyBoard(board);nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;if(!isKingFaceToFace(nb)&&!isInCheck(nb,color))legal.push(mv)}if(legal.length===0){return isMax?-30000:30000}legal=sortMoves(board,legal,depth);let bestMove=null;let flag=TT_UPPER;if(isMax){let best=-99999;for(let mv of legal){if(Date.now()>timeDeadLine)break;let nb=copyBoard(board);const cap=nb[mv.toR][mv.toC];nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;if(cap&&cap.toLowerCase()==='k'){storeTT(h,depth,22000,TT_EXACT,mv);return 22000}const inCheckNext=isInCheck(nb,COLOR.RED);let v=minimax(nb,depth-1,alpha,beta,false,inCheckNext);if(v>best){best=v;bestMove=mv;flag=TT_EXACT}alpha=Math.max(alpha,best);if(beta<=alpha){flag=TT_LOWER;if(!cap)addKiller(depth,mv);const hkey=mv.fromR*1000+mv.fromC*100+mv.toR*10+mv.toC;historyTable[hkey]=(historyTable[hkey]||0)+depth*depth;break}}storeTT(h,depth,best,flag,bestMove);return best}else{let best=99999;flag=TT_LOWER;for(let mv of legal){if(Date.now()>timeDeadLine)break;let nb=copyBoard(board);const cap=nb[mv.toR][mv.toC];nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;if(cap&&cap.toLowerCase()==='k'){storeTT(h,depth,-22000,TT_EXACT,mv);return -22000}const inCheckNext=isInCheck(nb,COLOR.BLACK);let v=minimax(nb,depth-1,alpha,beta,true,inCheckNext);if(v<best){best=v;bestMove=mv;flag=TT_EXACT}beta=Math.min(beta,best);if(beta<=alpha){flag=TT_UPPER;if(!cap)addKiller(depth,mv);const hkey=mv.fromR*1000+mv.fromC*100+mv.toR*10+mv.toC;historyTable[hkey]=(historyTable[hkey]||0)+depth*depth;break}}storeTT(h,depth,best,flag,bestMove);return best}}
function iterativeDeepening(board,maxDepth,timeLimit){timeDeadLine=Date.now()+timeLimit;tt.clear();historyTable={};killerMoves={};const key=board.flat().join(",");if(openingBook[key]){return openingBook[key]}let best=null;for(let d=1;d<=maxDepth;d++){if(Date.now()>timeDeadLine)break;let raw=getAllRawMoves(board,COLOR.BLACK);let legal=[];for(let mv of raw){let nb=copyBoard(board);nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;if(!isKingFaceToFace(nb)&&!isInCheck(nb,COLOR.BLACK))legal.push(mv)}if(!legal.length)break;legal=sortMoves(board,legal,d);let curBest=null;let curScore=-99999;for(let mv of legal){if(Date.now()>timeDeadLine)break;let nb=copyBoard(board);nb[mv.toR][mv.toC]=nb[mv.fromR][mv.fromC];nb[mv.fromR][mv.fromC]=null;const inCheck=isInCheck(nb,COLOR.RED);let sc=minimax(nb,d-1,-100000,100000,false,inCheck);if(sc>curScore){curScore=sc;curBest=mv}}if(curBest)best=curBest}return best}
onmessage=function(e){const{board,maxDepth,timeLimit}=e.data;const bestMove=iterativeDeepening(board,maxDepth,timeLimit);postMessage({bestMove})}
`;

const blob = new Blob([workerCode], {type: "application/javascript"});
const worker = new Worker(URL.createObjectURL(blob));

const COLOR = {RED:'red', BLACK:'black'};
const INITIAL_BOARD = [
  ['r','h','e','a','k','a','e','h','r'],
  [null,null,null,null,null,null,null,null,null],
  [null,'c',null,null,null,null,null,'c',null],
  ['s',null,'s',null,'s',null,'s',null,'s'],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  ['S',null,'S',null,'S',null,'S',null,'S'],
  [null,'C',null,null,null,null,null,'C',null],
  [null,null,null,null,null,null,null,null,null],
  ['R','H','E','A','K','A','E','H','R']
];

class XiangqiGame {
  constructor() {
    this.board = [];
    this.turn = COLOR.RED;
    this.selectedPiece = null;
    this.history = [];
    this.gameOver = false;
    this.isAiThinking = false;
    this.capturedRed = [];
    this.capturedBlack = [];
    this.winType = "";
    this.initBoard();
    this.renderGrid();
    this.renderPieces();
    this.updateStatus();
    
    document.getElementById('board').addEventListener('click', (e) => {
      if(e.target.id === 'board' || e.target.classList.contains('grid-lines') || e.target.classList.contains('river')) {
        this.clearHighlights();
        this.selectedPiece = null;
      }
    });
    
    worker.onmessage = (evt) => {
      this.onWorkerResult(evt.data.bestMove);
    };
  }

  showEffectFlag(text, type) {
    document.querySelectorAll('.effect-flag').forEach(el => el.remove());
    const flag = document.createElement('div');
    flag.className = 'effect-flag ' + type;
    flag.innerText = text;
    document.getElementById('board').appendChild(flag);
    if(type === "general") {
      setTimeout(() => { flag.remove(); }, 1600);
    } else {
      setTimeout(() => { flag.remove(); }, 1400);
    }
  }

  showKillSequence(killName) {
    this.showEffectFlag(killName, "general");
    setTimeout(() => { this.showEffectFlag("绝杀！", "general"); }, 800);
  }

  initBoard() {
    this.board = INITIAL_BOARD.map(row => [...row]);
    this.turn = COLOR.RED;
    this.selectedPiece = null;
    this.history = [];
    this.gameOver = false;
    this.isAiThinking = false;
    this.capturedRed = [];
    this.capturedBlack = [];
    this.winType = "";
    this.updateCapturedDisplay();
    this.updateUndoBtn();
  }

  updateUndoBtn() {
    const btn = document.getElementById('undoBtn');
    btn.disabled = (this.history.length < 2 || this.gameOver || this.isAiThinking);
  }

  restart() {
    this.initBoard();
    this.clearHighlights();
    this.renderPieces();
    this.updateStatus();
  }

  undo() {
    if(this.history.length < 2 || this.gameOver || this.isAiThinking) return;
    this.history.pop();
    const prevState = this.history.pop();
    if(prevState) {
      this.board = JSON.parse(JSON.stringify(prevState.board));
      this.turn = prevState.turn;
      this.capturedRed = [...prevState.capturedRed];
      this.capturedBlack = [...prevState.capturedBlack];
      this.gameOver = false;
      this.winType = "";
      this.selectedPiece = null;
      this.clearHighlights();
      this.renderPieces();
      this.updateStatus();
      this.updateCapturedDisplay();
      this.updateUndoBtn();
    }
  }

  copyBoard(b) { return b.map(r => [...r]); }

  findKing(board, color) {
    let targetChar = color === COLOR.RED ? 'K' : 'k';
    for(let r = 0; r < 10; r++) {
      for(let c = 0; c < 9; c++) {
        if(board[r][c] === targetChar) return {r, c};
      }
    }
    return null;
  }

  isKingFaceToFace(board) {
    let redKing = this.findKing(board, COLOR.RED);
    let blackKing = this.findKing(board, COLOR.BLACK);
    if(!redKing || !blackKing) return false;
    if(redKing.c !== blackKing.c) return false;
    let minR = Math.min(redKing.r, blackKing.r);
    let maxR = Math.max(redKing.r, blackKing.r);
    for(let r = minR + 1; r < maxR; r++) {
      if(board[r][redKing.c]) return false;
    }
    return true;
  }

  isInCheck(board, color) {
    let kingPos = this.findKing(board, color);
    if(!kingPos) return true;
    const enemy = color === COLOR.RED ? COLOR.BLACK : COLOR.RED;
    const enemyMoves = this.getAllRawMoves(board, enemy);
    for(let m of enemyMoves) {
      if(m.toR === kingPos.r && m.toC === kingPos.c) return true;
    }
    if(this.isKingFaceToFace(board)) return true;
    return false;
  }

  getLegalMoves(board, color) {
    const rawMoves = this.getAllRawMoves(board, color);
    const legal = [];
    for(let mv of rawMoves) {
      const cp = this.copyBoard(board);
      cp[mv.toR][mv.toC] = cp[mv.fromR][mv.fromC];
      cp[mv.fromR][mv.fromC] = null;
      if(!this.isKingFaceToFace(cp) && !this.isInCheck(cp, color)) {
        legal.push(mv);
      }
    }
    return legal;
  }

  getAllRawMoves(board, color) {
    let moves = [];
    for(let r = 0; r < 10; r++) {
      for(let c = 0; c < 9; c++) {
        let p = board[r][c];
        if(!p) continue;
        let isRed = p === p.toUpperCase();
        if((color === COLOR.RED && isRed) || (color === COLOR.BLACK && !isRed)) {
          let vm = this.getRawValid(r, c, board);
          vm.forEach(v => moves.push({fromR: r, fromC: c, toR: v.r, toC: v.c}));
        }
      }
    }
    return moves;
  }

  getRawValid(r, c, board) {
    let p = board[r][c];
    if(!p) return [];
    let t = p.toLowerCase(), isRed = p === p.toUpperCase();
    let mv = [];
    const add = (tr, tc) => {
      if(tr < 0 || tr >= 10 || tc < 0 || tc >= 9) return;
      let tar = board[tr][tc];
      if(!tar || (isRed && tar === tar.toLowerCase()) || (!isRed && tar === tar.toUpperCase())) {
        mv.push({r: tr, c: tc});
      }
    };
    switch(t) {
      case 'k':
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc;
          if(nc >= 3 && nc <= 5) {
            if(isRed && nr >= 7 && nr <= 9) add(nr, nc);
            if(!isRed && nr >= 0 && nr <= 2) add(nr, nc);
          }
        });
        break;
      case 'a':
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc;
          if(nc >= 3 && nc <= 5) {
            if(isRed && nr >= 7 && nr <= 9) add(nr, nc);
            if(!isRed && nr >= 0 && nr <= 2) add(nr, nc);
          }
        });
        break;
      case 'e':
        [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc;
          if(isRed && nr < 5) return;
          if(!isRed && nr > 4) return;
          let er = r + dr/2, ec = c + dc/2;
          if(er >= 0 && er < 10 && ec >= 0 && ec < 9 && !board[er][ec]) add(nr, nc);
        });
        break;
      case 'h':
        [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc;
          let lr = r, lc = c;
          if(Math.abs(dr) === 2) lr += dr/2; else lc += dc/2;
          if(lr >= 0 && lr < 10 && lc >= 0 && lc < 9 && !board[lr][lc]) add(nr, nc);
        });
        break;
      case 'r':
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc;
          while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
            if(!board[nr][nc]) mv.push({r: nr, c: nc});
            else {
              if((isRed && board[nr][nc] === board[nr][nc].toLowerCase()) || (!isRed && board[nr][nc] === board[nr][nc].toUpperCase())) {
                mv.push({r: nr, c: nc});
              }
              break;
            }
            nr += dr; nc += dc;
          }
        });
        break;
      case 'c':
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => {
          let nr = r + dr, nc = c + dc, jump = false;
          while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
            if(!board[nr][nc]) {
              if(!jump) mv.push({r: nr, c: nc});
            } else {
              if(!jump) jump = true;
              else {
                if((isRed && board[nr][nc] === board[nr][nc].toLowerCase()) || (!isRed && board[nr][nc] === board[nr][nc].toUpperCase())) {
                  mv.push({r: nr, c: nc});
                }
                break;
              }
            }
            nr += dr; nc += dc;
          }
        });
        break;
      case 's':
        let fwd = isRed ? -1 : 1;
        add(r + fwd, c);
        if((isRed && r <= 4) || (!isRed && r >= 5)) {
          add(r, c - 1);
          add(r, c + 1);
        }
        break;
    }
    return mv;
  }

  // 杀法识别
  getRealAttackers(board, color) {
    const kp = this.findKing(board, color);
    if(!kp) return [];
    const enemy = color === COLOR.RED ? COLOR.BLACK : COLOR.RED;
    const raw = this.getAllRawMoves(board, enemy);
    const res = [];
    for(const mv of raw) {
      if(mv.toR !== kp.r || mv.toC !== kp.c) continue;
      const attacker = board[mv.fromR][mv.fromC];
      const nb = this.copyBoard(board);
      nb[mv.toR][mv.toC] = attacker;
      nb[mv.fromR][mv.fromC] = null;
      if(this.isKingFaceToFace(nb)) continue;
      if(this.isInCheck(nb, enemy)) continue;
      res.push({r: mv.fromR, c: mv.fromC, type: attacker.toLowerCase(), piece: attacker});
    }
    return res;
  }

  countBetween(board, r1, c1, r2, c2) {
    let cnt = 0;
    if(r1 === r2) {
      const mn = Math.min(c1, c2), mx = Math.max(c1, c2);
      for(let c = mn + 1; c < mx; c++) if(board[r1][c]) cnt++;
    } else if(c1 === c2) {
      const mn = Math.min(r1, r2), mx = Math.max(r1, r2);
      for(let r = mn + 1; r < mx; r++) if(board[r][c1]) cnt++;
    }
    return cnt;
  }

  classifyCheckmate(board, checkedColor) {
    const kp = this.findKing(board, checkedColor);
    if(!kp) return {type: "captureKing", name: "吃掉将帅"};
    const checkedIsRed = checkedColor === COLOR.RED;
    const enemyColor = checkedIsRed ? COLOR.BLACK : COLOR.RED;
    const enemyCannonChar = checkedIsRed ? 'c' : 'C';
    const enemyCarChar = checkedIsRed ? 'r' : 'R';
    const enemyHorseChar = checkedIsRed ? 'h' : 'H';
    const ownUpper = checkedIsRed;

    if(this.isKingFaceToFace(board)) return {type: "flyingGeneral", name: "白脸将(飞将)"};
    
    const attackers = this.getRealAttackers(board, checkedColor);
    const legalAll = this.getLegalMoves(board, enemyColor);
    const kingLegal = this.getLegalMoves(board, checkedColor).filter(m => m.fromR === kp.r && m.fromC === kp.c);
    
    const allEnemyCars = [], allEnemyCannons = [], allEnemyHorses = [], allEnemySoldiers = [];
    for(let r = 0; r < 10; r++) {
      for(let c = 0; c < 9; c++) {
        const p = board[r][c];
        if(!p) continue;
        if(p === enemyCarChar) allEnemyCars.push({r, c});
        if(p === enemyCannonChar) allEnemyCannons.push({r, c});
        if(p === enemyHorseChar) allEnemyHorses.push({r, c});
        if(p.toLowerCase() === 's' && ((checkedIsRed && p === p.toLowerCase()) || (!checkedIsRed && p === p.toUpperCase()))) {
          allEnemySoldiers.push({r, c});
        }
      }
    }

    const controlsKingEscape = (piece) => {
      for(const mv of legalAll) {
        if(mv.fromR !== piece.r || mv.fromC !== piece.c) continue;
        for(const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          const nr = kp.r + dr, nc = kp.c + dc;
          if(mv.toR === nr && mv.toC === nc) return true;
        }
      }
      return false;
    };

    const betweenCount = (a, b) => {
      if(a.r === b.r) return this.countBetween(board, a.r, a.c, b.r, b.c);
      if(a.c === b.c) return this.countBetween(board, a.r, a.c, b.r, b.c);
      return -1;
    };

    // 双车错
    const carAttackers = attackers.filter(a => a.type === 'r');
    let doubleCar = false;
    if(carAttackers.length >= 2) doubleCar = true;
    else if(carAttackers.length === 1) {
      for(const car of allEnemyCars) {
        if(car.r === carAttackers[0].r && car.c === carAttackers[0].c) continue;
        if(controlsKingEscape(car)) { doubleCar = true; break; }
      }
      if(!doubleCar) {
        for(let i = 0; i < allEnemyCars.length; i++) {
          for(let j = i + 1; j < allEnemyCars.length; j++) {
            if(betweenCount(allEnemyCars[i], allEnemyCars[j]) === 0) { doubleCar = true; break; }
          }
        }
      }
    }
    if(doubleCar) return {type: "doubleCar", name: "双车错"};

    // 重炮
    const isDoubleCannon = () => {
      for(let i = 0; i < allEnemyCannons.length; i++) {
        for(let j = i + 1; j < allEnemyCannons.length; j++) {
          const a = allEnemyCannons[i], b = allEnemyCannons[j];
          if(a.r === b.r && kp.r === a.r) {
            const mn = Math.min(a.c, b.c), mx = Math.max(a.c, b.c);
            if(this.countBetween(board, a.r, mn, a.r, mx) <= 1) {
              const kc = kp.c;
              if(kc < mn || kc > mx) {
                const near = Math.abs(a.c - kc) < Math.abs(b.c - kc) ? a : b;
                if(this.countBetween(board, near.r, near.c, kp.r, kp.c) === 0) return true;
              }
            }
          }
          if(a.c === b.c && kp.c === a.c) {
            const mn = Math.min(a.r, b.r), mx = Math.max(a.r, b.r);
            if(this.countBetween(board, mn, a.c, mx, a.c) <= 1) {
              const kr = kp.r;
              if(kr < mn || kr > mx) {
                const near = Math.abs(a.r - kr) < Math.abs(b.r - kr) ? a : b;
                if(this.countBetween(board, near.r, near.c, kp.r, kp.c) === 0) return true;
              }
            }
          }
        }
      }
      return false;
    };
    if(isDoubleCannon()) return {type: "doubleCannon", name: "重炮"};

    // 马后炮
    const horseAttackers = attackers.filter(a => a.type === 'h');
    if(horseAttackers.length > 0) {
      for(const h of horseAttackers) {
        for(const cn of allEnemyCannons) {
          if(cn.r === h.r && h.r === kp.r) {
            const c1 = Math.min(cn.c, h.c), c2 = Math.max(cn.c, h.c);
            const c3 = Math.min(h.c, kp.c), c4 = Math.max(h.c, kp.c);
            if(this.countBetween(board, cn.r, c1, cn.r, c2) === 0 && this.countBetween(board, h.r, c3, h.r, c4) === 0) {
              return {type: "horseCannon", name: "马后炮"};
            }
          }
          if(cn.c === h.c && h.c === kp.c) {
            const r1 = Math.min(cn.r, h.r), r2 = Math.max(cn.r, h.r);
            const r3 = Math.min(h.r, kp.r), r4 = Math.max(h.r, kp.r);
            if(this.countBetween(board, r1, cn.c, r2, cn.c) === 0 && this.countBetween(board, r3, h.c, r4, h.c) === 0) {
              return {type: "horseCannon", name: "马后炮"};
            }
          }
        }
      }
    }

    // 闷宫
    const hasCannonOrHorseCheck = attackers.some(a => a.type === 'c' || a.type === 'h');
    if(hasCannonOrHorseCheck && kingLegal.length === 0) {
      let blockCount = 0;
      for(const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = kp.r + dr, nc = kp.c + dc;
        if(nr < 0 || nr >= 10 || nc < 0 || nc >= 9) continue;
        const p = board[nr][nc];
        if(p && ((ownUpper && p === p.toUpperCase()) || (!ownUpper && p === p.toLowerCase()))) blockCount++;
      }
      if(blockCount >= 3) return {type: "smothered", name: "闷宫"};
    }

    // 铁门栓
    for(const car of allEnemyCars) {
      if(car.c !== kp.c) continue;
      if(this.countBetween(board, car.r, kp.c, kp.r, kp.c) !== 0) continue;
      for(const other of [...allEnemyCars, ...allEnemyCannons, ...allEnemyHorses, ...allEnemySoldiers]) {
        if(other.r === car.r && other.c === car.c) continue;
        if(controlsKingEscape(other)) return {type: "ironBolt", name: "铁门栓"};
      }
    }

    // 单子绝杀
    if(attackers.length === 1) {
      const a = attackers[0];
      if(a.type === 'r') return {type: "checkmate", name: "单车绝杀"};
      if(a.type === 'c') {
        if(isDoubleCannon()) return {type: "doubleCannon", name: "重炮"};
        return {type: "checkmate", name: "单炮绝杀"};
      }
      if(a.type === 'h') return {type: "checkmate", name: "单马绝杀"};
      if(a.type === 's') return {type: "checkmate", name: "单兵绝杀"};
    }
    return {type: "checkmate", name: "绝杀"};
  }

  triggerAiThink() {
    if(this.gameOver || this.isAiThinking) return;
    this.isAiThinking = true;
    this.updateUndoBtn();
    
    let pieceCnt = 0;
    for(let r = 0; r < 10; r++) {
      for(let c = 0; c < 9; c++) {
        if(this.board[r][c]) pieceCnt++;
      }
    }
    
    const level = parseInt(document.getElementById("aiLevelSelect").value);
    let maxDepth, timeLimit;
    if(level === 1) { maxDepth = 2; timeLimit = 400; }
    else if(level === 3) { maxDepth = pieceCnt <= 12 ? 6 : 4; timeLimit = 900; }
    else if(level === 5) { maxDepth = pieceCnt <= 12 ? 9 : 6; timeLimit = 1500; }
    else { maxDepth = pieceCnt <= 12 ? 13 : 11; timeLimit = 2200; }
    
    worker.postMessage({board: this.copyBoard(this.board), maxDepth, timeLimit});
  }

  onWorkerResult(bestMove) {
    if(!bestMove) {
      const blackInCheck = this.isInCheck(this.board, COLOR.BLACK);
      if(blackInCheck) {
        const info = this.classifyCheckmate(this.board, COLOR.BLACK);
        this.showKillSequence(info.name);
        this.endGame(COLOR.RED, "checkmate", info);
      } else {
        this.endGame(COLOR.RED, "stalemate");
      }
      this.isAiThinking = false;
      this.updateUndoBtn();
      return;
    }
    this.executeMove(bestMove.fromR, bestMove.fromC, bestMove.toR, bestMove.toC, true);
  }

  renderGrid() {
    const container = document.getElementById('gridLines');
    container.innerHTML = '';
    for(let i = 0; i < 10; i++) {
      const line = document.createElement('div');
      line.className = 'grid-line-h';
      line.style.top = `${i * 50}px`;
      container.appendChild(line);
    }
    for(let i = 0; i < 9; i++) {
      const lineTop = document.createElement('div');
      lineTop.className = 'grid-line-v';
      lineTop.style.left = `${i * 50}px`;
      lineTop.style.height = '200px';
      container.appendChild(lineTop);
      
      const lineBottom = document.createElement('div');
      lineBottom.className = 'grid-line-v';
      lineBottom.style.left = `${i * 50}px`;
      lineBottom.style.top = '250px';
      lineBottom.style.height = '200px';
      container.appendChild(lineBottom);
      
      if(i === 0 || i === 8) {
        const connect = document.createElement('div');
        connect.className = 'grid-line-v';
        connect.style.left = `${i * 50}px`;
        connect.style.top = '200px';
        connect.style.height = '50px';
        container.appendChild(connect);
      }
    }
    this.addSlash(container, 3, 0, 5, 2);
    this.addSlash(container, 5, 0, 3, 2);
    this.addSlash(container, 3, 7, 5, 9);
    this.addSlash(container, 5, 7, 3, 9);
  }

  addSlash(container, x1, y1, x2, y2) {
    const slash = document.createElement('div');
    slash.className = 'slash';
    const length = Math.sqrt(Math.pow((x2 - x1) * 50, 2) + Math.pow((y2 - y1) * 50, 2));
    const angle = Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI;
    slash.style.width = `${length}px`;
    slash.style.left = `${x1 * 50}px`;
    slash.style.top = `${y1 * 50}px`;
    slash.style.transform = `rotate(${angle}deg)`;
    container.appendChild(slash);
  }

  renderPieces() {
    document.querySelectorAll('.piece').forEach(el => el.remove());
    document.querySelectorAll('.dot').forEach(el => el.remove());
    
    for(let r = 0; r < 10; r++) {
      for(let c = 0; c < 9; c++) {
        const code = this.board[r][c];
        if(code) this.createPieceElement(r, c, code);
      }
    }
    
    if(this.history.length > 0) {
      const lastMove = this.history[this.history.length - 1].move;
      if(lastMove) this.highlightLastMove(lastMove.toR, lastMove.toC);
    }
    
    if(this.isInCheck(this.board, this.turn)) {
      const king = this.findKing(this.board, this.turn);
      if(king) {
        const el = document.querySelector(`.piece[data-r="${king.r}"][data-c="${king.c}"]`);
        if(el) el.classList.add("check");
      }
    }
  }

  createPieceElement(r, c, code) {
    const div = document.createElement('div');
    const isRed = code === code.toUpperCase();
    const type = code.toLowerCase();
    div.className = `piece ${isRed ? 'red' : 'black'}`;
    div.innerText = this.getPieceChar(type, isRed);
    div.style.left = `${c * 50 + 2}px`;
    div.style.top = `${r * 50 + 2}px`;
    div.dataset.r = r;
    div.dataset.c = c;
    div.onclick = (e) => {
      e.stopPropagation();
      this.handlePieceClick(r, c, isRed);
    };
    document.getElementById('board').appendChild(div);
  }

  getPieceChar(type, isRed) {
    const map = {
      k: isRed ? '帅' : '将',
      a: isRed ? '仕' : '士',
      e: isRed ? '相' : '象',
      h: isRed ? '马' : '马',
      r: isRed ? '车' : '车',
      c: isRed ? '炮' : '炮',
      s: isRed ? '兵' : '卒'
    };
    return map[type];
  }

  highlightLastMove(r, c) {
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(p => {
      if(parseInt(p.dataset.r) === r && parseInt(p.dataset.c) === c) {
        p.classList.add('last-move');
      }
    });
  }

  clearHighlights() {
    document.querySelectorAll('.piece').forEach(p => {
      p.classList.remove('selected');
      p.classList.remove('last-move');
      p.classList.remove('check');
    });
    document.querySelectorAll('.dot').forEach(d => d.remove());
  }

  showValidMoves(moves) {
    moves.forEach(m => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.left = `${m.c * 50 + 25}px`;
      dot.style.top = `${m.r * 50 + 25}px`;
      dot.onclick = (e) => {
        e.stopPropagation();
        this.executeMove(this.selectedPiece.r, this.selectedPiece.c, m.r, m.c);
      };
      document.getElementById('board').appendChild(dot);
    });
  }

  handlePieceClick(r, c, isRed) {
    if(this.gameOver || this.turn !== COLOR.RED || this.isAiThinking) return;
    
    if(isRed) {
      this.clearHighlights();
      this.selectedPiece = {r, c};
      const el = document.querySelector(`.piece[data-r="${r}"][data-c="${c}"]`);
      if(el) el.classList.add('selected');
      
      const allLegal = this.getLegalMoves(this.board, COLOR.RED);
      const pieceMoves = allLegal.filter(m => m.fromR === r && m.fromC === c).map(x => ({r: x.toR, c: x.toC}));
      this.showValidMoves(pieceMoves);
    } else if(this.selectedPiece) {
      const allLegal = this.getLegalMoves(this.board, COLOR.RED);
      const ok = allLegal.some(m => m.fromR === this.selectedPiece.r && m.fromC === this.selectedPiece.c && m.toR === r && m.toC === c);
      if(ok) this.executeMove(this.selectedPiece.r, this.selectedPiece.c, r, c);
    }
  }

  executeMove(fromR, fromC, toR, toC, isAi = false) {
    const piece = this.board[fromR][fromC];
    const target = this.board[toR][toC];
    
    this.history.push({
      board: JSON.parse(JSON.stringify(this.board)),
      turn: this.turn,
      capturedRed: [...this.capturedRed],
      capturedBlack: [...this.capturedBlack],
      move: {fromR, fromC, toR, toC}
    });
    
    if(target) {
      this.showEffectFlag("吃", "capture");
      if(target === target.toUpperCase()) this.capturedRed.push(target);
      else this.capturedBlack.push(target);
    }
    
    this.board[toR][toC] = piece;
    this.board[fromR][fromC] = null;
    
    this.clearHighlights();
    this.selectedPiece = null;
    this.renderPieces();
    this.updateCapturedDisplay();
    this.updateUndoBtn();
    
    if(target && target.toLowerCase() === 'k') {
      this.endGame(this.turn, "captureKing");
      return;
    }
    
    const prevTurn = this.turn;
    this.turn = this.turn === COLOR.RED ? COLOR.BLACK : COLOR.RED;
    
    const nextLegal = this.getLegalMoves(this.board, this.turn);
    if(nextLegal.length === 0) {
      if(this.isInCheck(this.board, this.turn)) {
        const info = this.classifyCheckmate(this.board, this.turn);
        this.showKillSequence(info.name);
        this.endGame(prevTurn, "checkmate", info);
      } else {
        this.endGame(prevTurn, "stalemate");
      }
      return;
    } else {
      if(this.isInCheck(this.board, this.turn)) {
        this.showEffectFlag("将军！", "general");
      }
    }
    
    this.updateStatus();
    if(this.turn === COLOR.BLACK && !this.gameOver && !isAi) {
      this.triggerAiThink();
    } else {
      this.isAiThinking = false;
      this.updateUndoBtn();
    }
  }

  updateCapturedDisplay() {
    const redContainer = document.getElementById('capturedRed');
    const blackContainer = document.getElementById('capturedBlack');
    redContainer.innerHTML = '';
    blackContainer.innerHTML = '';
    
    this.capturedRed.forEach(p => {
      const el = document.createElement('div');
      el.className = 'captured-piece red';
      el.innerText = this.getPieceChar(p.toLowerCase(), true);
      redContainer.appendChild(el);
    });
    
    this.capturedBlack.forEach(p => {
      const el = document.createElement('div');
      el.className = 'captured-piece black';
      el.innerText = this.getPieceChar(p.toLowerCase(), false);
      blackContainer.appendChild(el);
    });
  }

  endGame(winner, winType, info) {
    this.gameOver = true;
    this.isAiThinking = false;
    this.winType = winType;
    this.updateUndoBtn();
    
    const statusEl = document.getElementById('gameStatus');
    let msg, alertMsg;
    const killName = info && info.name ? info.name : "绝杀";
    
    if(winner === COLOR.RED) {
      if(winType === "captureKing") {
        msg = "红方胜利(吃掉黑将)";
        alertMsg = "恭喜你获胜！胜利方式：吃掉对方将帅";
      } else if(winType === "checkmate") {
        msg = "红方胜利(" + killName + ")";
        alertMsg = "恭喜你获胜！胜利方式：" + killName + "，对方无合法走子";
      } else {
        msg = "红方胜利(困毙)";
        alertMsg = "恭喜你获胜！胜利方式：对方困毙（无子可走且未被将军，按规则判负）";
      }
      statusEl.innerText = msg;
      statusEl.className = "text-lg font-semibold text-red-600";
    } else {
      if(winType === "captureKing") {
        msg = "AI胜利(吃掉红帅)";
        alertMsg = "AI获胜，再接再厉！失败方式：你的将帅被吃掉";
      } else if(winType === "checkmate") {
        msg = "AI胜利(" + killName + ")";
        alertMsg = "AI获胜，再接再厉！失败方式：你被" + killName + "，无合法走子";
      } else {
        msg = "AI胜利(困毙)";
        alertMsg = "AI获胜，再接再厉！失败方式：你被困毙（无子可走且未被将军，按规则判负）";
      }
      statusEl.innerText = msg;
      statusEl.className = "text-lg font-semibold text-black";
    }
    setTimeout(() => { alert(alertMsg); }, 2000);
  }

  updateStatus() {
    if(this.gameOver) return;
    const ind = document.getElementById('turnIndicator');
    if(this.turn === COLOR.RED) {
      ind.innerHTML = '<i class="fa fa-user"></i> 红方 (玩家)';
      ind.className = "text-xl font-bold text-red-600 flex items-center gap-2";
    } else {
      ind.innerHTML = '<i class="fa fa-robot"></i> 黑方 (AI)';
      ind.className = "text-xl font-bold text-gray-800 flex items-center gap-2";
    }
    
    if(this.isInCheck(this.board, this.turn)) {
      document.getElementById('gameStatus').innerText = "被将军！";
      document.getElementById('gameStatus').className = "text-lg font-semibold text-red-600";
    } else {
      document.getElementById('gameStatus').innerText = "进行中";
      document.getElementById('gameStatus').className = "text-lg font-semibold text-green-600";
    }
  }
}

const game = new XiangqiGame();
