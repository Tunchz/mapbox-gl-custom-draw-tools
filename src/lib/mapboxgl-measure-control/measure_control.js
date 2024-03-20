
import mapboxGl from 'mapbox-gl';
import * as turf from '@turf/turf';
import './measure_control.css';

class MeasureControl {
    constructor(opt) {
        let ctrl = this
        console.log("--- initialize MeasureControl : ", opt)
        ctrl.DEFAULTS = {
            linestring : {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                }
            },
            circleRadius: 3.5,
            circleColor: '#fff',
            lineColor: '#44bff0',
            lineWidth: 3,
            lineCap: 'round',
            lineJoin: 'round', 
        };

        ctrl.onRemoveOrig = opt.draw.onRemove;
        ctrl.horizontal = opt.draw.options?.horizontal;
        ctrl.draw = opt.draw
        ctrl.options = Object.assign({},  ctrl.DEFAULTS, opt.draw.options);

        //不能删除 不然会报错的
        ctrl._onClick = ctrl._onClick.bind(this);
        ctrl._onDblClick = ctrl._onDblClick.bind(this);
        ctrl._onMousemove = ctrl._onMousemove.bind(this);
        ctrl._onAddSourceLayer = ctrl._onAddSourceLayer.bind(this);
        ctrl._toggleState = ctrl._toggleState.bind(this);
        ctrl._onAddMouseTips = ctrl._onAddMouseTips.bind(this);
        ctrl._toggleCursor = ctrl._toggleCursor.bind(this);
        ctrl._onMeasureStart = ctrl._onMeasureStart.bind(this);
        ctrl._getPointsList = ctrl._getPointsList.bind(this);
        ctrl._getLineDistance = ctrl._getLineDistance.bind(this);
        ctrl._bindPointPopup = ctrl._bindPointPopup.bind(this);
        ctrl._removeMeasure = ctrl._removeMeasure.bind(this);
        ctrl._removeCurPopups = ctrl._removeCurPopups.bind(this);
        ctrl._toggleEvents = ctrl._toggleEvents.bind(this);
    }

    /**
     * @description 加载Measure组件
     * @param {any} map
     * @returns 
     */
    onAdd(map) {
        let ctrl = this;
        ctrl._map = map;
        ctrl._container = document.createElement('div');
        ctrl._container.className = `mapboxgl-ctrl-group mapboxgl-ctrl custom-tools-group${ctrl.horizontal?" horizontal":"vertical"} ${ctrl.options?.edge}`;
        ctrl.elContainer = ctrl._container;
        ctrl.draw.groups_item&&ctrl.draw.groups_item.push(ctrl.elContainer)
        
        ctrl.state = 'off';

        //所有测距geojson
        ctrl.geojsonList = {};

        //储存可能冲突的事件
        ctrl.events = {};
        
        ctrl._map.on('click', ctrl._onClick);
        ctrl._map.on('dblclick', ctrl._onDblClick);
        ctrl._map.on('mousemove', ctrl._onMousemove);

        // ctrl._measureOnButton = ctrl._createNode('button','mapboxgl-ctrl-icon mapboxgl-ctrl-measure-off','',ctrl._container, 'measure-off',ctrl._onMeasureStart);
        ctrl._measureOnButton = document.createElement('button');
        ctrl._measureOnButton.setAttribute('aria-label','measure-off');
        ctrl._measureOnButton.className = 'mapboxgl-ctrl-icon measure-off fixed';
        ctrl._measureOnButton.title = "Measure Length";
        ctrl._measureOnButton.addEventListener('click',ctrl._onMeasureStart);
        ctrl._container.append(ctrl._measureOnButton)




        return ctrl._container;
    };


    /**
     * @description 卸载Measure组件
     */
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map.off('click', this._onClick);
        this._map.off('dblclick', this._onDblClick);
        this._map.off('mousemove', this._onMousemove);
        this._map = undefined;
        ctrl.onRemoveOrig(map);
    };

    // /**
    //  * @description 获取控件的默认位置
    //  * ['top-left','top-right','bottom-left','bottom-right']
    //  * @returns 
    //  */
    getDefaultPosition(){
        return 'bottom-right';
    }

    /**
     * @description 创建button，绑定button到对应父级，并返回button的引用
     * @param {string} className button的类名
     * @param {node} container button绑定的父级node
     * @param {string} ariaLabel button的aria-label属性值
     * @param {func} fn click事件触发的方法
     * @returns {node}
     */
    _createNode(node,className,textContent,container, ariaLabel, fn){
        var a = document.createElement(node);
        a.className = className;
        a.textContent = textContent;
        a.setAttribute('aria-label',ariaLabel);
        if(fn) a.addEventListener('click', fn);
        container.appendChild(a);
        
        return a;
    }

    _removeNode(node, fn) {
        node.remove();
        if(fn) node.removeEventListener('click', fn);
    }


    /**
     * @description map的click事件
     * @param {any} e
     */
    _onClick(e){
        
        if(this.state === 'off') return;

        var map = this._map;
        var features = map.queryRenderedFeatures(e.point, { layers: ['measure-points-' + this._name] });

        //更新tips的文字
        this.tips.textContent = 'คลิกเพื่อเพิ่มจุด คลิกสองครั้งเมื่อเสร็จสิ้น';

        //画点
        var point = this.point = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.lngLat.lng, e.lngLat.lat]
            },
            "properties": {
                "id": String(new Date().getTime()),
                "curDistance": 0.0,
                "prevDistance": 0.0
            }
        };

        this.curGeojson.features.push(point);
            
        //画线
        var PointList = this._getPointsList();
        if(PointList.length >=2) {
            this.lineString.geometry.coordinates = PointList.map(function(point) {
                return point.geometry.coordinates;
            });

            //计算距离
            this.prevDis = this.curDis || 0.0;
            this.curDis = this._getLineDistance(this.lineString, 'kilometers');

            //将距离放到每个点的properties里
            var last = this.curGeojson.features.length - 1;
            this.curGeojson.features[last].properties.curDistance = this.curDis;
            this.curGeojson.features[last].properties.prevDistance = this.prevDis;
            
            this.curGeojson.features.push(this.lineString);
        }

        //设置map的dataSource
        map.getSource('measure-geojson-' + this._name).setData(this.curGeojson);

        //每个point绑定popup
        this._bindPointPopup(PointList);
        
    }

    /**
     * @description 计算线段的距离
     * @param {geojson} geojson geometry的type为LineString
     * @param {unit} 测量单位
     * @return {Number} 距离
     */
    _getLineDistance(lineString,unit) {
        return turf.lineDistance(lineString, unit).toLocaleString();
    }

    /**
     * @description 获取所有的Point geojson格式
     * @return {Array} Point数组
     */
    _getPointsList(){
        return this.curGeojson.features.filter(function(item) {
            return item.geometry.type === 'Point';
        });
    }

    /**
     * @description 删除当前测距实例的popups
     * @param {string} name 当前测距实例的名字
     */
    _removeCurPopups(name){
        this.geojsonList[name]?.popups?.map(function(popup){
            popup.remove();
        });
    }

    /**
     * @description 给每个Point绑定popup
     * @param {array} popup数组
     */
    _bindPointPopup(list) {

        var _this = this;
        
        //清除原先所有的popup
        this._removeCurPopups(this._name);

        //重新绑定popup
        list?.map(function(point) {

            var popup = new mapboxGl.Popup({
                    closeButton: false,
                    closeOnClick: false, 
                    total:point.properties.curDistance, 
                    prev: point.properties.prevDistance
                })
                .setLngLat(point.geometry.coordinates)
                .setHTML(`ระยะ : ${point.properties.curDistance} km${point.properties.prevDistance?' (+'+(point.properties.curDistance-point.properties.prevDistance).toFixed(3)+')':''}`)
                .addTo(_this._map);

            popup._container.className += ' mapbox-measure-popup';
            _this.geojsonList[_this._name].popups.push(popup);

        });

    }

    /** 
     * @description map的dblClick事件
     * @param {any} e
     */
    _onDblClick(e){

        if(this.state === 'off') return;

        this._toggleEvents('add','click');
        this._measureOnButton.setAttribute('aria-label','measure-off');
        this._measureOnButton.className = "mapboxgl-ctrl-icon measure-off fixed";

        //删除鼠标跟随tips
        this._removeNode(this.tips);
        //修改鼠标手势
        this._toggleCursor('-webkit-grab');
        // 重置记录的点击坐标
        this.point = void 0;
        
        //创建删除当前测距的button
        var length = this.geojsonList[this._name].popups.length;
        var options = this.geojsonList[this._name].popups[length - 2]?.options || {};
        this.geojsonList[this._name].popups[length - 1]?.remove()
        this.geojsonList[this._name].popups[length - 2]?.setHTML("<div>"+`ระยะ : ${options.total} km${options.prev?' (+'+(options.total-options.prev).toFixed(3)+')':''}`+"<button data-name='"+this._name+"' id='dele-btn-"+this._name+"'>x</button></div>");
        // document.getElementById('dele-btn-'+this._name).addEventListener('click', this._removeMeasure);
        this.removeMeasureButton = document.getElementById('dele-btn-'+this._name)
        this.removeMeasureButton?.addEventListener('click', this._removeMeasure);
        this._toggleState('off');
    }

    /**
     * @description 删除当前name的Measure实例
     */
    _removeMeasure(e){
        var name = e?.target?.getAttribute('data-name');
        var map = this._map;
        map.getLayer('measure-points-' + name)&&map.removeLayer('measure-points-' + name);
        map.getLayer('measure-lines-' + name)&&map.removeLayer('measure-lines-' + name);
        map.getSource('measure-geojson-'+ name)&&map.removeSource('measure-geojson-'+ name);
        // 删除mousemove layer
        map.getLayer('measure-lines-mousemove')&&map.removeLayer('measure-lines-mousemove');
        map.getSource('measure-geojson-mousemove')&&map.removeSource('measure-geojson-mousemove');

        //删除当前name的所有的popup
        this._removeCurPopups(name);
        this.removeMeasureButton = null;

        //删除当前name的geojson对象
        delete this.geojsonList[name];
    
    }

    /**
     * @description map的点击测距按钮事件，进入测距模式，删除map的其他点击事件，禁用map的双击放大效果
     * @param {any} e
     */
    _onMeasureStart(e){
        
        if(this.state === 'on') { 
            this._onDblClick(e);
            this.removeMeasureButton&&this.removeMeasureButton.click();
            this._removeMeasure();
            return;
        }
        this.removeMeasureButton&&this.removeMeasureButton.click();
        //进入测距模式
        this._toggleState('on');
        this._measureOnButton.setAttribute('aria-label','measure-on');
        this._measureOnButton.className = "mapboxgl-ctrl-icon measure-on fixed active";

        //禁用map的其他click事件
        // this._toggleEvents('remove','click');
        //初始化总距离、之前的距离
        this.prevDis = 0.0;
        this.curDis = 0.0;

        //设置鼠标手势
        this._toggleCursor('crosshair');

        //创建跟随鼠标提示框
        this.mouseTips = this._onAddMouseTips(e);

        //设置当前测距实例的唯一key
        this._name = String(new Date().getTime());
        
        //创建当前测距的mapSource、mapLayer
        this._onAddSourceLayer(e);

    }

    /**
     * @description 创建鼠标跟随提示框
     * @param {event} 鼠标点击事件
     */
    _onAddMouseTips(e){
        var tips = this.tips =  this._createNode('div','measure_mousemove_tips','คลิกเพื่อเริ่ม',document.body,'mousemove_tips');
        //设置tips的样式
        tips.style.position = 'absolute';
        this._setTipsPosition(e,tips);
        
        return tips;
    }

    /**
     * @description 设置鼠标跟随tips的位置
     * @param {event} 鼠标移动事件
     * @param {tips} tips对应的dom元素
     */
    _setTipsPosition(e,tips){
        var x = e.pageX || e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        var y = e.pageY || e.clientY + (document.documentElement.scrollLeft || document.body.scrollLeft);
        tips.style.left = x + 10 + 'px';
        tips.style.top = y + 10 + 'px';
        tips.style.padding = '10px';
        tips.style.background = '#fff';
        tips.style.fontSize = '10px';
        tips.style.borderRadius = '3px';
        tips.style.boxShadow = '0 1px 2px rgba(0,0,0,0.10)';
    }

    /**
     * @description 创建MeasureControl的mapSource、mapLayer
     */
    _onAddSourceLayer(){
        //样式
        var circleRadius = this.options.circleRadius;
        var circleColor = this.options.circleColor;
        var lineWidth = this.options.lineWidth;
        var lineColor = this.options.lineColor;
        var lineCap = this.options.lineCap;
        var lineJoin = this.options.lineJoin;
        this.curGeojson = {
            "type": "FeatureCollection",
            "features": []
        };

        this.lineString = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": []
            }
        };
        //dataSource
        this._map.addSource('measure-geojson-' + this._name, {
            "type": "geojson",
            "data": this.curGeojson
        });

        //dataSource
        this._map.addSource('measure-geojson-mousemove', {
            "type": "geojson",
            "data":  {
                "type": "FeatureCollection",
                "features": []
            }
        });
        //线图层
        this._map.addLayer({
            id: 'measure-lines-' + this._name,
            type: 'line',
            source: 'measure-geojson-' + this._name,
            layout: {
                'line-cap': lineCap,
                'line-join': lineJoin
            },
            paint: {
                'line-color': lineColor,
                'line-width': lineWidth
            },
            filter: ['in', '$type', 'LineString']
        });

        //点图层
        this._map.addLayer({
            id: 'measure-points-' + this._name,
            type: 'circle',
            source: 'measure-geojson-' + this._name,
            paint: {
                'circle-stroke-width': lineWidth,
                'circle-stroke-color': lineColor,
                'circle-radius': circleRadius,
                'circle-color': circleColor,
            },
            filter: ['in', '$type', 'Point']
        });

        //mouseover线图层

        this._map.addLayer({
            id: 'measure-lines-mousemove',
            type: 'line',
            source: 'measure-geojson-mousemove',
            layout: {
                'line-cap': lineCap,
                'line-join': lineJoin
            },
            paint: {
                'line-color': lineColor,
                'line-width': lineWidth
            },
        });

        //保存所有的测绘feature、popup
        this.geojsonList[this._name] = {geojson: this.curGeojson,popups: []};
    }


    /**
     * @description map的点击测距按钮事件，结束测距模式
     * @param {any} e
     */
    _onMeasureEnd(e){
        console.log('measure off');
        this._toggleState('off');

    }

    /**
     * @description map的mousemove事件
     * @param {any} e
     */
    _onMousemove(e){

        if(this.state === 'off') return;

        //更新tips的位置
        this._setTipsPosition(e.originalEvent,this.tips);
        if(!this.point) return;

        //鼠标当前位置点
        var point = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.lngLat.lng, e.lngLat.lat]
            },
            "properties": {}
        };

        //绘制最后一个点和鼠标当前位置的线段
        var curcoord = this.point.geometry.coordinates;
        var lineString = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [curcoord,[e.lngLat.lng, e.lngLat.lat]]
            }
        };

        //测距鼠标位置和最后一个Point之间的距离
        var distance = this._getLineDistance(lineString, 'kilometers');
        //创建移动的线图层
        if((distance - 0) === 0) return;

        this._map.getSource('measure-geojson-mousemove').setData({
            "type": "FeatureCollection",
            "features": [lineString]
        });

        this.tips.innerText = 'ระยะ : '+ distance + ' km\nคลิกเพื่อเพิ่มจุด คลิกสองครั้งเมื่อเสร็จสิ้น';
    }

    /**
     * @description Measure组件的状态切换
     * @param {string} Oneof ['on','off']
     * @return {bool} 是否处于测距状态
     */
    _toggleState(state) {
        this.state = state;
        //禁用map双击放大效果
        if(state === 'on') {
            this._map.doubleClickZoom.disable();
        }else {
            this._map.doubleClickZoom.enable();
        }
    }

    /**
     * @description 鼠标手势的切换
     * @param {string} 鼠标手势
     */
    _toggleCursor(cursor) {
        this._map.getCanvas().style.cursor = cursor;
    }

    /**
     * @description 事件防冲突
     * @param {string} 是否防冲突
     * @param {string} 事件名称
     */
    _toggleEvents(toggle,event) {
        var _this = this;
        
        //假如没有储存对应event的事件
        if(!this.events[event]) {
            this.events[event] = [];
            this._map._listeners[event].map(function(item, index) {
                if(item.name !== 'bound ') {
                    _this.events[event].push(item);
                }
            });    
        } 

        if(this.events[event].length === 0) return;

        //off其他不相关的event事件
        if(toggle === 'remove') {
            this.events[event].map(function(item, index){
                _this._map.off(event, item);
            });
        }else if(toggle === 'add') {
            //重新监听所有event事件
            this.events[event].map(function(item, index){
                _this._map.on(event, item);
            });
        }
        
    }
}
export default MeasureControl;