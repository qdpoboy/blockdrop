cc.Class({
    extends: cc.Component,

    properties: {
        blockNode: cc.Node,
        step1Node: [cc.Node],
        step2Node: [cc.Node],
        scoreLabel: cc.Label,
        growTimerLabel: cc.Label,
        scoreLevelLabel: cc.Label,
    },

    onLoad() {
        this.node.on('touchstart', this.grow, this);
        this.node.on('touchend', this.stop, this);
        //得分
        this.gameScore = 0;
        this.init();
    },

    onDestroy() {
        this.node.off('touchstart', this.grow, this);
        this.node.off('touchend', this.stop, this);
    },

    init() {
        // 1 初始化状态 2 放大中 3 旋转中 4 下落中
        this.gameState = 1;
        this.growTimer = 0.00;
        this.growTimerLabel.getComponent(cc.Label).string = '0.00';
        //this.scoreLevelLabel.getComponent(cc.Label).string = '';
        this.setInitColor();
        this.setInitBlock();
        this.setInitStep();
    },

    grow() {
        if (this.gameState != 1) return;
        this.gameState = 2;
        //放大
        this.scaleAction = cc.scaleTo(0.7, 4);
        this.blockNode.runAction(this.scaleAction);
    },

    stop() {
        if (this.gameState != 2) return;
        this.gameState = 3;
        //停止放大
        this.blockNode.stopAction(this.scaleAction);
        //旋转回正
        this.rotateAction = cc.sequence(cc.rotateTo(0.2, 0), cc.callFunc(() => {
            if (this.gameState != 3) return;
            this.gameState = 4;
            let step1SpaceWidth = this.step1Node[1].x - this.step1Node[0].x;
            let step2SpaceWidth = this.step2Node[1].x - this.step2Node[0].x;
            let blockWidth = this.blockNode.width * this.blockNode.scaleX;
            let blockY = 0;
            if (blockWidth <= step1SpaceWidth) {//失败，落下去
                blockY = -1000;
                this.moveAction = cc.sequence(cc.moveTo(0.5, cc.v2(0, blockY)), cc.callFunc(() => {
                    this.gameOver();
                }));
                this.blockNode.runAction(this.moveAction);
            } else {//碰撞
                let win = false;
                if (blockWidth <= step2SpaceWidth) {//进坑，得分
                    win = true;
                    this.showWinLevel(blockWidth, step2SpaceWidth);
                    blockY = -(cc.winSize.height / 2 - this.step1Node[1].height - this.blockNode.height * this.blockNode.scaleX / 2);
                } else {//落在最上层
                    blockY = -(cc.winSize.height / 2 - this.step1Node[1].height - this.step2Node[1].height - this.blockNode.height * this.blockNode.scaleX / 2);
                }
                this.moveAction = cc.sequence(cc.moveTo(0.3, cc.v2(0, blockY)), cc.callFunc(() => {
                    if (win) {
                        this.updateScore(1);
                        this.init();
                    } else {
                        this.gameOver();
                    }
                }));
                this.blockNode.runAction(this.moveAction).easing(cc.easeBounceInOut());
            }
        }));
        this.blockNode.runAction(this.rotateAction);
    },

    //游戏结束
    gameOver() {
        cc.director.loadScene('main');
    },

    //得分等级
    showWinLevel(blockWidth, step2SpaceWidth) {
        let levelName = '';
        //上下两块台阶之间错位距离是50
        if (step2SpaceWidth - blockWidth <= 5 * 2) {
            levelName = '完美';
        } else if (step2SpaceWidth - blockWidth <= 15 * 2) {
            levelName = '很好';
        } else if (step2SpaceWidth - blockWidth <= 30 * 2) {
            levelName = '一般';
        } else if (step2SpaceWidth - blockWidth <= 40 * 2) {
            levelName = '很好';
        } else if (step2SpaceWidth - blockWidth <= 50 * 2) {
            levelName = '完美';
        }
        this.scoreLevelLabel.getComponent(cc.Label).string = levelName;
    },

    //更新游戏得分
    updateScore(score) {
        this.gameScore += score;
        this.scoreLabel.string = '得分：' + this.gameScore;
    },

    //初始化方块位置
    setInitBlock() {
        this.blockNode.runAction(
            //异步执行多个动作
            cc.spawn(
                cc.moveTo(0.3, cc.v2(0, 450)),
                cc.scaleTo(0.3, 1),
                cc.rotateTo(0.3, 45),
            )
        );
    },

    //初始化台阶位置
    setInitStep() {
        let disX = 20 - Math.random() * 40;
        this.step1Node[0].runAction(
            cc.moveBy(0.1, cc.v2(- disX, 0)),
        );
        this.step1Node[1].runAction(
            cc.moveBy(0.1, cc.v2(disX, 0)),
        );
        this.step2Node[0].runAction(
            cc.moveBy(0.1, cc.v2(- disX, 0)),
        );
        this.step2Node[1].runAction(
            cc.moveBy(0.1, cc.v2(disX, 0)),
        );
    },

    //初始化背景色
    setInitColor() {
        //随机背景色
        let bgColorArr = ['#880036', '#086F46', '#a3a380', '#588c7e', '#075F3C'];
        let randColor = bgColorArr[Math.floor(Math.random() * bgColorArr.length)];
        this.node.color = cc.Color.BLACK.fromHEX(randColor);
    },
    
    update (dt) {
        // console.log(dt);
        if (this.gameState == 2) {
            this.growTimer += dt;
            this.growTimerLabel.getComponent(cc.Label).string = this.growTimer.toFixed(2);
        }
    },
});
