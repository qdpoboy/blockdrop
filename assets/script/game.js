cc.Class({
    extends: cc.Component,

    properties: {
        //#4cb4e7 ffc09f c7b3e5 588c7e a3a380
        blockNode: cc.Node,
        step1Node: [cc.Node],
        step2Node: [cc.Node],
    },

    onLoad() {
        this.node.on('touchstart', this.grow, this);
        this.node.on('touchend', this.stop, this);
        this.init();
    },

    init() {
        // 1 初始化状态 2 放大中 3 旋转中 4 下落中
        this.gameState = 1;
    },

    grow() {
        if (this.gameState != 1) return;
        this.gameState = 2;
        //放大
        this.scaleAction = cc.scaleTo(1, 4);
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
                if (blockWidth <= step2SpaceWidth) {//进坑，得分
                    blockY = -(cc.winSize.height / 2 - this.step1Node[1].height - this.blockNode.height * this.blockNode.scaleX / 2);
                } else {//落在最上层
                    blockY = -(cc.winSize.height / 2 - this.step1Node[1].height - this.step2Node[1].height - this.blockNode.height * this.blockNode.scaleX / 2);
                }
                this.moveAction = cc.moveTo(0.3, cc.v2(0, blockY));
                this.blockNode.runAction(this.moveAction).easing(cc.easeBounceInOut());
            }
        }));
        this.blockNode.runAction(this.rotateAction);
    },

    gameOver() {
        cc.director.loadScene('main');
    },

    // update (dt) {},
});