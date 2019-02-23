export function addClass(el, className) {
    if(hasClass(el, className)) {
        return
    }
    let newClass = el.className.split(' ') //class名 分割加入到数组中
    newClass.push(className)  //加入新class名
    el.className = newClass.join(' ')  //数组合并为class名
}


//dom是否存在样式
export function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '($|\\s)')
    return reg.test(el.className)
}

//获取对应下标的数据
export function getData(el, name, val) {
    const prefix = 'data-'
    if (val) {
        return el.setAttribute(prefix + name, val)
    }
    return el.getAttribute(prefix + name)
}

//浏览器style前缀
let elementStyle = document.createElement('div').style

let vendor = (() => {
    let transfromNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    for(let key in transfromNames) {
        if(elementStyle[transfromNames[key]] !== undefined) {
            return key
        }
    }
    
    //都不满足即出错
    return false
})()

export function prefixStyle(style) {
    if(vendor === false) {
        return false
    }

    if(vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}