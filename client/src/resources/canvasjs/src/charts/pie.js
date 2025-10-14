import TextBlock from "../core/text_block";
import {
  convertPercentToValue,
  drawSegment,
  getLineDashArray,
} from "../helpers/utils";

export default function (plotUnit) {
  var _this = this;
  var totalDataSeries = plotUnit.dataSeriesIndexes.length;

  if (totalDataSeries <= 0) return;

  var dataSeriesIndex = plotUnit.dataSeriesIndexes[0];
  var dataSeries = this.data[dataSeriesIndex];
  var dataPoints = dataSeries.dataPoints;
  var indexLabelLineEdgeLength = 10;
  var explodeDuration = 500;

  var plotArea = this.plotArea;

  var dataPointEOs = [];

  var minDistanceBetweenLabels = 2;
  var indexLabelRadiusToRadiusRatio = 1.3;
  var poleAnglularDistance = (20 / 180) * Math.PI;
  var precision = 6;

  var center = {
    x: (plotArea.x2 + plotArea.x1) / 2,
    y: (plotArea.y2 + plotArea.y1) / 2,
  };

  var sum = 0;
  var isIndexLabelPresent = false;
  for (var j = 0; j < dataPoints.length; j++) {
    sum += Math.abs(dataPoints[j].y);

    if (
      !isIndexLabelPresent &&
      typeof dataPoints[j].indexLabel !== "undefined" &&
      dataPoints[j].indexLabel !== null &&
      dataPoints[j].indexLabel.toString().length > 0
    )
      isIndexLabelPresent = true;

    if (
      !isIndexLabelPresent &&
      typeof dataPoints[j].label !== "undefined" &&
      dataPoints[j].label !== null &&
      dataPoints[j].label.toString().length > 0
    )
      isIndexLabelPresent = true;
  }

  if (sum === 0) return;

  isIndexLabelPresent =
    isIndexLabelPresent ||
    (typeof dataSeries.indexLabel !== "undefined" &&
      dataSeries.indexLabel !== null &&
      dataSeries.indexLabel.toString().length > 0);

  var outerRadius =
    dataSeries.indexLabelPlacement !== "inside" && isIndexLabelPresent
      ? (Math.min(plotArea.width, plotArea.height) * 0.75) / 2
      : (Math.min(plotArea.width, plotArea.height) * 0.92) / 2;

  if (dataSeries.radius)
    outerRadius = convertPercentToValue(dataSeries.radius, outerRadius);

  var innerRadius =
    typeof dataSeries.innerRadius !== "undefined" &&
    dataSeries.innerRadius !== null
      ? convertPercentToValue(dataSeries.innerRadius, outerRadius)
      : 0.7 * outerRadius;

  var percentInnerRadius = Math.min(
    innerRadius / outerRadius,
    (outerRadius - 1) / outerRadius,
  );

  function initLabels() {
    if (!dataSeries || !dataPoints) return;

    var noDPNearSouthPole = 0;
    var noDPNearNorthPole = 0;
    var firstDPCloseToSouth = 0;
    var firstDPCloseToNorth = 0;

    for (j = 0; j < dataPoints.length; j++) {
      var dataPoint = dataPoints[j];
      var id = dataSeries.dataPointIds[j];

      var dataPointEO = {
        id: id,
        objectType: "dataPoint",
        dataPointIndex: j,
        dataSeriesIndex: 0,
      };
      dataPointEOs.push(dataPointEO);

      var percentAndTotal = {
        percent: null,
        total: null,
      };
      var formatterParameter = null;

      percentAndTotal = _this.getPercentAndTotal(dataSeries, dataPoint);

      if (dataSeries.indexLabelFormatter || dataPoint.indexLabelFormatter)
        formatterParameter = {
          chart: _this._options,
          dataSeries: dataSeries,
          dataPoint: dataPoint,
          total: percentAndTotal.total,
          percent: percentAndTotal.percent,
        };

      var indexLabelText = dataPoint.indexLabelFormatter
        ? dataPoint.indexLabelFormatter(formatterParameter)
        : dataPoint.indexLabel
          ? _this.replaceKeywordsWithValue(
              dataPoint.indexLabel,
              dataPoint,
              dataSeries,
              j,
            )
          : dataSeries.indexLabelFormatter
            ? dataSeries.indexLabelFormatter(formatterParameter)
            : dataSeries.indexLabel
              ? _this.replaceKeywordsWithValue(
                  dataSeries.indexLabel,
                  dataPoint,
                  dataSeries,
                  j,
                )
              : dataPoint.label
                ? dataPoint.label
                : "";

      _this._eventManager.objectMap[id] = dataPointEO;

      dataPointEO.center = {
        x: center.x,
        y: center.y,
      };
      dataPointEO.y = dataPoint.y;
      dataPointEO.radius = outerRadius;
      dataPointEO.percentInnerRadius = percentInnerRadius;
      dataPointEO.indexLabelText = indexLabelText;
      dataPointEO.indexLabelPlacement = dataSeries.indexLabelPlacement;
      dataPointEO.indexLabelLineColor = dataPoint.indexLabelLineColor
        ? dataPoint.indexLabelLineColor
        : dataSeries.indexLabelLineColor
          ? dataSeries.indexLabelLineColor
          : dataPoint.color
            ? dataPoint.color
            : dataSeries._colorSet[j % dataSeries._colorSet.length];
      dataPointEO.indexLabelLineThickness = dataPoint.indexLabelLineThickness
        ? dataPoint.indexLabelLineThickness
        : dataSeries.indexLabelLineThickness;
      dataPointEO.indexLabelLineDashType = dataPoint.indexLabelLineDashType
        ? dataPoint.indexLabelLineDashType
        : dataSeries.indexLabelLineDashType;
      dataPointEO.indexLabelFontColor = dataPoint.indexLabelFontColor
        ? dataPoint.indexLabelFontColor
        : dataSeries.indexLabelFontColor;
      dataPointEO.indexLabelFontStyle = dataPoint.indexLabelFontStyle
        ? dataPoint.indexLabelFontStyle
        : dataSeries.indexLabelFontStyle;
      dataPointEO.indexLabelFontWeight = dataPoint.indexLabelFontWeight
        ? dataPoint.indexLabelFontWeight
        : dataSeries.indexLabelFontWeight;
      dataPointEO.indexLabelFontSize = dataPoint.indexLabelFontSize
        ? dataPoint.indexLabelFontSize
        : dataSeries.indexLabelFontSize;
      dataPointEO.indexLabelFontFamily = dataPoint.indexLabelFontFamily
        ? dataPoint.indexLabelFontFamily
        : dataSeries.indexLabelFontFamily;
      dataPointEO.indexLabelBackgroundColor =
        dataPoint.indexLabelBackgroundColor
          ? dataPoint.indexLabelBackgroundColor
          : dataSeries.indexLabelBackgroundColor
            ? dataSeries.indexLabelBackgroundColor
            : null;
      dataPointEO.indexLabelMaxWidth = dataPoint.indexLabelMaxWidth
        ? dataPoint.indexLabelMaxWidth
        : dataSeries.indexLabelMaxWidth
          ? dataSeries.indexLabelMaxWidth
          : plotArea.width * 0.33;
      dataPointEO.indexLabelWrap =
        typeof dataPoint.indexLabelWrap !== "undefined"
          ? dataPoint.indexLabelWrap
          : dataSeries.indexLabelWrap;

      dataPointEO.startAngle =
        j === 0
          ? dataSeries.startAngle
            ? (dataSeries.startAngle / 180) * Math.PI
            : 0
          : dataPointEOs[j - 1].endAngle;

      dataPointEO.startAngle =
        (dataPointEO.startAngle + 2 * Math.PI) % (2 * Math.PI);

      dataPointEO.endAngle =
        dataPointEO.startAngle + ((2 * Math.PI) / sum) * Math.abs(dataPoint.y);

      var midAngle = (dataPointEO.endAngle + dataPointEO.startAngle) / 2;

      midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);

      dataPointEO.midAngle = midAngle;

      if (
        dataPointEO.midAngle > Math.PI / 2 - poleAnglularDistance &&
        dataPointEO.midAngle < Math.PI / 2 + poleAnglularDistance
      ) {
        if (
          noDPNearSouthPole === 0 ||
          dataPointEOs[firstDPCloseToSouth].midAngle > dataPointEO.midAngle
        )
          firstDPCloseToSouth = j;

        noDPNearSouthPole++;
      } else if (
        dataPointEO.midAngle > (3 * Math.PI) / 2 - poleAnglularDistance &&
        dataPointEO.midAngle < (3 * Math.PI) / 2 + poleAnglularDistance
      ) {
        if (
          noDPNearNorthPole === 0 ||
          dataPointEOs[firstDPCloseToNorth].midAngle > dataPointEO.midAngle
        )
          firstDPCloseToNorth = j;

        noDPNearNorthPole++;
      }

      if (midAngle > Math.PI / 2 && midAngle <= (3 * Math.PI) / 2)
        dataPointEO.hemisphere = "left";
      else dataPointEO.hemisphere = "right";

      dataPointEO.indexLabelTextBlock = new TextBlock(_this.plotArea.ctx, {
        fontSize: dataPointEO.indexLabelFontSize,
        fontFamily: dataPointEO.indexLabelFontFamily,
        fontColor: dataPointEO.indexLabelFontColor,
        fontStyle: dataPointEO.indexLabelFontStyle,
        fontWeight: dataPointEO.indexLabelFontWeight,
        horizontalAlign: "left",
        backgroundColor: dataPointEO.indexLabelBackgroundColor,
        maxWidth: dataPointEO.indexLabelMaxWidth,
        maxHeight: dataPointEO.indexLabelWrap
          ? dataPointEO.indexLabelFontSize * 5
          : dataPointEO.indexLabelFontSize * 1.5,
        text: dataPointEO.indexLabelText,
        padding: 0,
        textBaseline: "top",
      });

      dataPointEO.indexLabelTextBlock.measureText();
    }

    var noOfDPToRightOfSouthPole = 0;
    var noOfDPToLeftOfNorthPole = 0;
    var keepSameDirection = false;

    for (j = 0; j < dataPoints.length; j++) {
      var dataPointEO =
        dataPointEOs[(firstDPCloseToSouth + j) % dataPoints.length];

      if (
        noDPNearSouthPole > 1 &&
        dataPointEO.midAngle > Math.PI / 2 - poleAnglularDistance &&
        dataPointEO.midAngle < Math.PI / 2 + poleAnglularDistance
      ) {
        if (
          noOfDPToRightOfSouthPole <= noDPNearSouthPole / 2 &&
          !keepSameDirection
        ) {
          dataPointEO.hemisphere = "right";
          noOfDPToRightOfSouthPole++;
        } else {
          dataPointEO.hemisphere = "left";
          keepSameDirection = true;
        }
      }
    }

    keepSameDirection = false;
    for (j = 0; j < dataPoints.length; j++) {
      var dataPointEO =
        dataPointEOs[(firstDPCloseToNorth + j) % dataPoints.length];

      if (
        noDPNearNorthPole > 1 &&
        dataPointEO.midAngle > (3 * Math.PI) / 2 - poleAnglularDistance &&
        dataPointEO.midAngle < (3 * Math.PI) / 2 + poleAnglularDistance
      ) {
        if (
          noOfDPToLeftOfNorthPole <= noDPNearNorthPole / 2 &&
          !keepSameDirection
        ) {
          dataPointEO.hemisphere = "left";
          noOfDPToLeftOfNorthPole++;
        } else {
          dataPointEO.hemisphere = "right";
          keepSameDirection = true;
        }
      }
    }
  }

  function renderLabels() {
    var ctx = _this.plotArea.ctx;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "grey";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    var i = 0;

    for (i = 0; i < dataPoints.length; i++) {
      var dataPointEO = dataPointEOs[i];

      if (!dataPointEO.indexLabelText) continue;

      dataPointEO.indexLabelTextBlock.y -=
        dataPointEO.indexLabelTextBlock.height / 2;

      var xOffset = 0;

      if (dataPointEO.hemisphere === "left") {
        var xOffset =
          dataSeries.indexLabelPlacement !== "inside"
            ? -(
                dataPointEO.indexLabelTextBlock.width + indexLabelLineEdgeLength
              )
            : -dataPointEO.indexLabelTextBlock.width / 2;
      } else {
        var xOffset =
          dataSeries.indexLabelPlacement !== "inside"
            ? indexLabelLineEdgeLength
            : -dataPointEO.indexLabelTextBlock.width / 2;
      }

      dataPointEO.indexLabelTextBlock.x += xOffset;
      dataPointEO.indexLabelTextBlock.render(true);
      dataPointEO.indexLabelTextBlock.x -= xOffset;

      dataPointEO.indexLabelTextBlock.y +=
        dataPointEO.indexLabelTextBlock.height / 2;

      if (dataPointEO.indexLabelPlacement !== "inside") {
        var indexLabelLineStartX =
          dataPointEO.center.x + outerRadius * Math.cos(dataPointEO.midAngle);
        var indexLabelLineStartY =
          dataPointEO.center.y + outerRadius * Math.sin(dataPointEO.midAngle);

        ctx.strokeStyle = dataPointEO.indexLabelLineColor;
        ctx.lineWidth = dataPointEO.indexLabelLineThickness;

        if (ctx.setLineDash) {
          ctx.setLineDash(
            getLineDashArray(
              dataPointEO.indexLabelLineDashType,
              dataPointEO.indexLabelLineThickness,
            ),
          );
        }

        ctx.beginPath();
        ctx.moveTo(indexLabelLineStartX, indexLabelLineStartY);
        ctx.lineTo(
          dataPointEO.indexLabelTextBlock.x,
          dataPointEO.indexLabelTextBlock.y,
        );
        ctx.lineTo(
          dataPointEO.indexLabelTextBlock.x +
            (dataPointEO.hemisphere === "left"
              ? -indexLabelLineEdgeLength
              : indexLabelLineEdgeLength),
          dataPointEO.indexLabelTextBlock.y,
        );
        ctx.stroke();
      }

      ctx.lineJoin = "miter";
    }
  }

  function animate(fractionComplete) {
    var ctx = _this.plotArea.ctx;

    ctx.clearRect(plotArea.x1, plotArea.y1, plotArea.width, plotArea.height);
    ctx.fillStyle = _this.backgroundColor;
    ctx.fillRect(plotArea.x1, plotArea.y1, plotArea.width, plotArea.height);

    var maxAngle = dataPointEOs[0].startAngle + 2 * Math.PI * fractionComplete;

    for (var i = 0; i < dataPoints.length; i++) {
      var startAngle = i === 0 ? dataPointEOs[i].startAngle : endAngle;
      var endAngle =
        startAngle + (dataPointEOs[i].endAngle - dataPointEOs[i].startAngle);

      var shouldBreak = false;

      if (endAngle > maxAngle) {
        endAngle = maxAngle;
        shouldBreak = true;
      }

      var color = dataPoints[i].color
        ? dataPoints[i].color
        : dataSeries._colorSet[i % dataSeries._colorSet.length];

      if (endAngle > startAngle)
        drawSegment(
          _this.plotArea.ctx,
          dataPointEOs[i].center,
          dataPointEOs[i].radius,
          color,
          dataSeries.type,
          startAngle,
          endAngle,
          dataSeries.fillOpacity,
          dataPointEOs[i].percentInnerRadius,
        );

      if (shouldBreak) break;
    }
  }

  function explodeToggle(fractionComplete) {
    var ctx = _this.plotArea.ctx;

    ctx.clearRect(plotArea.x1, plotArea.y1, plotArea.width, plotArea.height);
    ctx.fillStyle = _this.backgroundColor;
    ctx.fillRect(plotArea.x1, plotArea.y1, plotArea.width, plotArea.height);

    for (var i = 0; i < dataPoints.length; i++) {
      var startAngle = dataPointEOs[i].startAngle;
      var endAngle = dataPointEOs[i].endAngle;

      if (endAngle > startAngle) {
        var offsetX = outerRadius * 0.07 * Math.cos(dataPointEOs[i].midAngle);
        var offsetY = outerRadius * 0.07 * Math.sin(dataPointEOs[i].midAngle);
        var isInTransition = false;

        if (dataPoints[i].exploded) {
          if (
            Math.abs(dataPointEOs[i].center.x - (center.x + offsetX)) >
              0.000000001 ||
            Math.abs(dataPointEOs[i].center.y - (center.y + offsetY)) >
              0.000000001
          ) {
            dataPointEOs[i].center.x = center.x + offsetX * fractionComplete;
            dataPointEOs[i].center.y = center.y + offsetY * fractionComplete;

            isInTransition = true;
          }
        } else if (
          Math.abs(dataPointEOs[i].center.x - center.x) > 0 ||
          Math.abs(dataPointEOs[i].center.y - center.y) > 0
        ) {
          dataPointEOs[i].center.x =
            center.x + offsetX * (1 - fractionComplete);
          dataPointEOs[i].center.y =
            center.y + offsetY * (1 - fractionComplete);

          isInTransition = true;
        }

        if (isInTransition) {
          var entry = {};
          entry.dataSeries = dataSeries;
          entry.dataPoint = dataSeries.dataPoints[i];
          entry.index = i;
          _this._toolTip.highlightObjects([entry]);
        }

        var color = dataPoints[i].color
          ? dataPoints[i].color
          : dataSeries._colorSet[i % dataSeries._colorSet.length];

        drawSegment(
          _this.plotArea.ctx,
          dataPointEOs[i].center,
          dataPointEOs[i].radius,
          color,
          dataSeries.type,
          startAngle,
          endAngle,
          dataSeries.fillOpacity,
          dataPointEOs[i].percentInnerRadius,
        );
      }
    }

    renderLabels();
  }

  function areDataPointsTooClose(first, second) {
    var label1 = {
      x1: first.indexLabelTextBlock.x,
      y1: first.indexLabelTextBlock.y - first.indexLabelTextBlock.height / 2,
      x2: first.indexLabelTextBlock.x + first.indexLabelTextBlock.width,
      y2: first.indexLabelTextBlock.y + first.indexLabelTextBlock.height / 2,
    };
    var label2 = {
      x1: second.indexLabelTextBlock.x,
      y1: second.indexLabelTextBlock.y - second.indexLabelTextBlock.height / 2,
      x2: second.indexLabelTextBlock.x + second.indexLabelTextBlock.width,
      y2: second.indexLabelTextBlock.y + second.indexLabelTextBlock.height / 2,
    };

    if (
      label1.x2 < label2.x1 - indexLabelLineEdgeLength ||
      label1.x1 > label2.x2 + indexLabelLineEdgeLength ||
      label1.y1 > label2.y2 + indexLabelLineEdgeLength ||
      label1.y2 < label2.y1 - indexLabelLineEdgeLength
    )
      return false;

    return true;
  }

  function getVerticalDistanceBetweenLabels(first, second) {
    var distance = 0;
    var label1 = {
      y: first.indexLabelTextBlock.y,
      y1: first.indexLabelTextBlock.y - first.indexLabelTextBlock.height / 2,
      y2: first.indexLabelTextBlock.y + first.indexLabelTextBlock.height / 2,
    };
    var label2 = {
      y: second.indexLabelTextBlock.y,
      y1: second.indexLabelTextBlock.y - second.indexLabelTextBlock.height / 2,
      y2: second.indexLabelTextBlock.y + second.indexLabelTextBlock.height / 2,
    };

    if (label2.y > label1.y) {
      distance = label2.y1 - label1.y2;
    } else {
      distance = label1.y1 - label2.y2;
    }

    return distance;
  }

  function getNextLabelIndex(currentLabelIndex) {
    var nextLabelIndex = null;

    for (var i = 1; i < dataPoints.length; i++) {
      nextLabelIndex =
        (currentLabelIndex + i + dataPointEOs.length) % dataPointEOs.length;

      if (
        dataPointEOs[nextLabelIndex].hemisphere !==
        dataPointEOs[currentLabelIndex].hemisphere
      ) {
        nextLabelIndex = null;
        break;
      } else if (
        dataPointEOs[nextLabelIndex].indexLabelText &&
        nextLabelIndex !== currentLabelIndex &&
        (getVerticalDistanceBetweenLabels(
          dataPointEOs[nextLabelIndex],
          dataPointEOs[currentLabelIndex],
        ) < 0 ||
          (dataPointEOs[currentLabelIndex].hemisphere === "right"
            ? dataPointEOs[nextLabelIndex].indexLabelTextBlock.y >=
              dataPointEOs[currentLabelIndex].indexLabelTextBlock.y
            : dataPointEOs[nextLabelIndex].indexLabelTextBlock.y <=
              dataPointEOs[currentLabelIndex].indexLabelTextBlock.y))
      )
        break;
      else {
        nextLabelIndex = null;
      }
    }

    return nextLabelIndex;
  }

  function getPreviousLabelIndex(currentLabelIndex) {
    var prevLabelIndex = null;

    for (var i = 1; i < dataPoints.length; i++) {
      prevLabelIndex =
        (currentLabelIndex - i + dataPointEOs.length) % dataPointEOs.length;

      if (
        dataPointEOs[prevLabelIndex].hemisphere !==
        dataPointEOs[currentLabelIndex].hemisphere
      ) {
        prevLabelIndex = null;
        break;
      } else if (
        dataPointEOs[prevLabelIndex].indexLabelText &&
        dataPointEOs[prevLabelIndex].hemisphere ===
          dataPointEOs[currentLabelIndex].hemisphere &&
        prevLabelIndex !== currentLabelIndex &&
        (getVerticalDistanceBetweenLabels(
          dataPointEOs[prevLabelIndex],
          dataPointEOs[currentLabelIndex],
        ) < 0 ||
          (dataPointEOs[currentLabelIndex].hemisphere === "right"
            ? dataPointEOs[prevLabelIndex].indexLabelTextBlock.y <=
              dataPointEOs[currentLabelIndex].indexLabelTextBlock.y
            : dataPointEOs[prevLabelIndex].indexLabelTextBlock.y >=
              dataPointEOs[currentLabelIndex].indexLabelTextBlock.y))
      )
        break;
      else {
        prevLabelIndex = null;
      }
    }

    return prevLabelIndex;
  }

  function rePositionLabels(dataPointIndex, offset) {
    offset = offset || 0;

    var actualOffset = 0;

    var labelYMin = center.y - indexLabelRadius * 1;
    var labelYMax = center.y + indexLabelRadius * 1;

    if (dataPointIndex >= 0 && dataPointIndex < dataPoints.length) {
      var dataPointEO = dataPointEOs[dataPointIndex];
      if (
        (offset < 0 && dataPointEO.indexLabelTextBlock.y < labelYMin) ||
        (offset > 0 && dataPointEO.indexLabelTextBlock.y > labelYMax)
      )
        return 0;

      var validOffset = offset;

      {
        var distFromIndexLineStart = 0;
        var indexLabelLineStartX = 0;
        var indexLabelLineStartY = 0;
        var indexLabelAngle = 0;
        var indexLabelAngleWhenTangent = 0;

        if (validOffset < 0) {
          if (
            dataPointEO.indexLabelTextBlock.y -
              dataPointEO.indexLabelTextBlock.height / 2 >
              labelYMin &&
            dataPointEO.indexLabelTextBlock.y -
              dataPointEO.indexLabelTextBlock.height / 2 +
              validOffset <
              labelYMin
          )
            validOffset = -(
              labelYMin -
              (dataPointEO.indexLabelTextBlock.y -
                dataPointEO.indexLabelTextBlock.height / 2 +
                validOffset)
            );
        } else {
          if (
            dataPointEO.indexLabelTextBlock.y +
              dataPointEO.indexLabelTextBlock.height / 2 <
              labelYMin &&
            dataPointEO.indexLabelTextBlock.y +
              dataPointEO.indexLabelTextBlock.height / 2 +
              validOffset >
              labelYMax
          )
            validOffset =
              dataPointEO.indexLabelTextBlock.y +
              dataPointEO.indexLabelTextBlock.height / 2 +
              validOffset -
              labelYMax;
        }

        var newlabelY = dataPointEO.indexLabelTextBlock.y + validOffset;
        var newlabelX = 0;

        if (dataPointEO.hemisphere === "right") {
          newlabelX =
            center.x +
            Math.sqrt(
              Math.pow(indexLabelRadius, 2) - Math.pow(newlabelY - center.y, 2),
            );
        } else
          newlabelX =
            center.x -
            Math.sqrt(
              Math.pow(indexLabelRadius, 2) - Math.pow(newlabelY - center.y, 2),
            );

        indexLabelLineStartX =
          center.x + outerRadius * Math.cos(dataPointEO.midAngle);
        indexLabelLineStartY =
          center.y + outerRadius * Math.sin(dataPointEO.midAngle);

        distFromIndexLineStart = Math.sqrt(
          Math.pow(newlabelX - indexLabelLineStartX, 2) +
            Math.pow(newlabelY - indexLabelLineStartY, 2),
        );

        indexLabelAngleWhenTangent = Math.acos(outerRadius / indexLabelRadius);

        indexLabelAngle = Math.acos(
          (indexLabelRadius * indexLabelRadius +
            outerRadius * outerRadius -
            distFromIndexLineStart * distFromIndexLineStart) /
            (2 * outerRadius * indexLabelRadius),
        );

        if (indexLabelAngle < indexLabelAngleWhenTangent) {
          validOffset = newlabelY - dataPointEO.indexLabelTextBlock.y;
        } else {
          validOffset = 0;
        }
      }

      var prevDataPointIndex = getPreviousLabelIndex(dataPointIndex);

      var nextDataPointIndex = getNextLabelIndex(dataPointIndex);

      var otherDataPointIndex, distanceFromOtherLabel;
      var otherDataPointOffset = 0;
      var otherDataPointActualOffset = 0;

      if (validOffset < 0) {
        otherDataPointIndex =
          dataPointEO.hemisphere === "right"
            ? prevDataPointIndex
            : nextDataPointIndex;

        actualOffset = validOffset;

        if (otherDataPointIndex !== null) {
          var tempOffset = -validOffset;

          var distanceFromOtherLabel =
            dataPointEO.indexLabelTextBlock.y -
            dataPointEO.indexLabelTextBlock.height / 2 -
            (dataPointEOs[otherDataPointIndex].indexLabelTextBlock.y +
              dataPointEOs[otherDataPointIndex].indexLabelTextBlock.height / 2);

          if (distanceFromOtherLabel - tempOffset < minDistanceBetweenLabels) {
            otherDataPointOffset = -tempOffset;
            otherDataPointActualOffset = rePositionLabels(
              otherDataPointIndex,
              otherDataPointOffset,
              recursionCount + 1,
            );

            if (
              +otherDataPointActualOffset.toFixed(precision) >
              +otherDataPointOffset.toFixed(precision)
            ) {
              if (distanceFromOtherLabel > minDistanceBetweenLabels)
                actualOffset = -(
                  distanceFromOtherLabel - minDistanceBetweenLabels
                );
              else
                actualOffset = -(
                  tempOffset -
                  (otherDataPointActualOffset - otherDataPointOffset)
                );
            }
          }
        }
      } else if (validOffset > 0) {
        otherDataPointIndex =
          dataPointEO.hemisphere === "right"
            ? nextDataPointIndex
            : prevDataPointIndex;

        actualOffset = validOffset;

        if (otherDataPointIndex !== null) {
          var tempOffset = validOffset;

          var distanceFromOtherLabel =
            dataPointEOs[otherDataPointIndex].indexLabelTextBlock.y -
            dataPointEOs[otherDataPointIndex].indexLabelTextBlock.height / 2 -
            (dataPointEO.indexLabelTextBlock.y +
              dataPointEO.indexLabelTextBlock.height / 2);

          if (distanceFromOtherLabel - tempOffset < minDistanceBetweenLabels) {
            otherDataPointOffset = tempOffset;
            otherDataPointActualOffset = rePositionLabels(
              otherDataPointIndex,
              otherDataPointOffset,
              recursionCount + 1,
            );

            if (
              +otherDataPointActualOffset.toFixed(precision) <
              +otherDataPointOffset.toFixed(precision)
            ) {
              if (distanceFromOtherLabel > minDistanceBetweenLabels)
                actualOffset =
                  distanceFromOtherLabel - minDistanceBetweenLabels;
              else
                actualOffset =
                  tempOffset -
                  (otherDataPointOffset - otherDataPointActualOffset);
            }
          }
        }
      }

      if (actualOffset) {
        var newLabelY = dataPointEO.indexLabelTextBlock.y + actualOffset;

        var newLabelX = 0;

        if (dataPointEO.hemisphere === "right") {
          newLabelX =
            center.x +
            Math.sqrt(
              Math.pow(indexLabelRadius, 2) - Math.pow(newLabelY - center.y, 2),
            );
        } else
          newLabelX =
            center.x -
            Math.sqrt(
              Math.pow(indexLabelRadius, 2) - Math.pow(newLabelY - center.y, 2),
            );

        if (
          dataPointEO.midAngle > Math.PI / 2 - poleAnglularDistance &&
          dataPointEO.midAngle < Math.PI / 2 + poleAnglularDistance
        ) {
          var prevDPIndex =
            (dataPointIndex - 1 + dataPointEOs.length) % dataPointEOs.length;
          var prevDP = dataPointEOs[prevDPIndex];
          var nextDP =
            dataPointEOs[
              (dataPointIndex + 1 + dataPointEOs.length) % dataPointEOs.length
            ];

          if (
            dataPointEO.hemisphere === "left" &&
            prevDP.hemisphere === "right" &&
            newLabelX > prevDP.indexLabelTextBlock.x
          ) {
            newLabelX = prevDP.indexLabelTextBlock.x - 15;
          } else if (
            dataPointEO.hemisphere === "right" &&
            nextDP.hemisphere === "left" &&
            newLabelX < nextDP.indexLabelTextBlock.x
          ) {
            newLabelX = nextDP.indexLabelTextBlock.x + 15;
          }
        } else if (
          dataPointEO.midAngle > (3 * Math.PI) / 2 - poleAnglularDistance &&
          dataPointEO.midAngle < (3 * Math.PI) / 2 + poleAnglularDistance
        ) {
          var prevDPIndex =
            (dataPointIndex - 1 + dataPointEOs.length) % dataPointEOs.length;
          var prevDP = dataPointEOs[prevDPIndex];
          var nextDP =
            dataPointEOs[
              (dataPointIndex + 1 + dataPointEOs.length) % dataPointEOs.length
            ];

          if (
            dataPointEO.hemisphere === "right" &&
            prevDP.hemisphere === "left" &&
            newLabelX < prevDP.indexLabelTextBlock.x
          ) {
            newLabelX = prevDP.indexLabelTextBlock.x + 15;
          } else if (
            dataPointEO.hemisphere === "left" &&
            nextDP.hemisphere === "right" &&
            newLabelX > nextDP.indexLabelTextBlock.x
          ) {
            newLabelX = nextDP.indexLabelTextBlock.x - 15;
          }
        }

        dataPointEO.indexLabelTextBlock.y = newLabelY;

        dataPointEO.indexLabelTextBlock.x = newLabelX;

        dataPointEO.indexLabelAngle = Math.atan2(
          dataPointEO.indexLabelTextBlock.y - center.y,
          dataPointEO.indexLabelTextBlock.x - center.x,
        );
      }
    }

    return actualOffset;
  }

  function positionLabels() {
    var ctx = _this.plotArea.ctx;

    ctx.fillStyle = "grey";
    ctx.strokeStyle = "grey";
    var fontSize = 16;
    ctx.font = fontSize + "px Arial";
    ctx.textBaseline = "middle";
    var i = 0,
      j = 0;
    var deltaR = 0;

    var resizeFlag = true;

    for (j = 0; j < 10 && (j < 1 || deltaR > 0); j++) {
      if (
        dataSeries.radius ||
        (!dataSeries.radius &&
          typeof dataSeries.innerRadius !== "undefined" &&
          dataSeries.innerRadius !== null &&
          outerRadius - deltaR <= innerRadius)
      )
        resizeFlag = false;

      if (resizeFlag) outerRadius -= deltaR;

      deltaR = 0;

      if (dataSeries.indexLabelPlacement !== "inside") {
        var indexLabelRadius = outerRadius * indexLabelRadiusToRadiusRatio;

        for (i = 0; i < dataPoints.length; i++) {
          var dataPointEO = dataPointEOs[i];

          dataPointEO.indexLabelTextBlock.x =
            center.x + indexLabelRadius * Math.cos(dataPointEO.midAngle);
          dataPointEO.indexLabelTextBlock.y =
            center.y + indexLabelRadius * Math.sin(dataPointEO.midAngle);

          dataPointEO.indexLabelAngle = dataPointEO.midAngle;
          dataPointEO.radius = outerRadius;
          dataPointEO.percentInnerRadius = percentInnerRadius;
        }

        var currentDataPoint, nextDataPoint;
        for (i = 0; i < dataPoints.length; i++) {
          var dataPointEO = dataPointEOs[i];
          var nextDataPointIndex = getNextLabelIndex(i);

          if (nextDataPointIndex === null) continue;

          currentDataPoint = dataPointEOs[i];
          nextDataPoint = dataPointEOs[nextDataPointIndex];

          var distanceFromNextLabel = 0;

          distanceFromNextLabel =
            getVerticalDistanceBetweenLabels(currentDataPoint, nextDataPoint) -
            minDistanceBetweenLabels;

          if (distanceFromNextLabel < 0) {
            var dataPointsAbove = 0;
            var dataPointsBelow = 0;

            for (var k = 0; k < dataPoints.length; k++) {
              if (k === i) continue;

              if (dataPointEOs[k].hemisphere !== dataPointEO.hemisphere)
                continue;

              if (
                dataPointEOs[k].indexLabelTextBlock.y <
                dataPointEO.indexLabelTextBlock.y
              )
                dataPointsAbove++;
              else dataPointsBelow++;
            }

            var upWardsOffset =
              (distanceFromNextLabel /
                (dataPointsAbove + dataPointsBelow || 1)) *
              dataPointsBelow;
            var downWardsOffset = -1 * (distanceFromNextLabel - upWardsOffset);

            var actualUpwardOffset = 0;
            var actualDownwardOffset = 0;

            if (dataPointEO.hemisphere === "right") {
              actualUpwardOffset = rePositionLabels(i, upWardsOffset);

              downWardsOffset =
                -1 * (distanceFromNextLabel - actualUpwardOffset);

              actualDownwardOffset = rePositionLabels(
                nextDataPointIndex,
                downWardsOffset,
              );

              if (
                +actualDownwardOffset.toFixed(precision) <
                  +downWardsOffset.toFixed(precision) &&
                +actualUpwardOffset.toFixed(precision) <=
                  +upWardsOffset.toFixed(precision)
              )
                rePositionLabels(i, -(downWardsOffset - actualDownwardOffset));
            } else {
              actualUpwardOffset = rePositionLabels(
                nextDataPointIndex,
                upWardsOffset,
              );

              downWardsOffset =
                -1 * (distanceFromNextLabel - actualUpwardOffset);

              actualDownwardOffset = rePositionLabels(i, downWardsOffset);

              if (
                +actualDownwardOffset.toFixed(precision) <
                  +downWardsOffset.toFixed(precision) &&
                +actualUpwardOffset.toFixed(precision) <=
                  +upWardsOffset.toFixed(precision)
              )
                rePositionLabels(
                  nextDataPointIndex,
                  -(downWardsOffset - actualDownwardOffset),
                );
            }
          }
        }
      } else {
        for (i = 0; i < dataPoints.length; i++) {
          var dataPointEO = dataPointEOs[i];
          indexLabelRadius =
            dataSeries.type === "pie" ? outerRadius * 0.7 : outerRadius * 0.8;

          var dx = center.x + indexLabelRadius * Math.cos(dataPointEO.midAngle);
          var dy = center.y + indexLabelRadius * Math.sin(dataPointEO.midAngle);

          dataPointEO.indexLabelTextBlock.x = dx;
          dataPointEO.indexLabelTextBlock.y = dy;
        }
      }

      for (i = 0; i < dataPoints.length; i++) {
        dataPointEO = dataPointEOs[i];

        var size = dataPointEO.indexLabelTextBlock.measureText();
        if (size.height === 0 || size.width === 0) continue;

        var xOverflow = 0;
        var xdr = 0;

        if (dataPointEO.hemisphere === "right") {
          xOverflow =
            plotArea.x2 -
            (dataPointEO.indexLabelTextBlock.x +
              dataPointEO.indexLabelTextBlock.width +
              indexLabelLineEdgeLength);
          xOverflow *= -1;
        } else {
          xOverflow =
            plotArea.x1 -
            (dataPointEO.indexLabelTextBlock.x -
              dataPointEO.indexLabelTextBlock.width -
              indexLabelLineEdgeLength);
        }
        if (xOverflow > 0) {
          if (!resizeFlag && dataPointEO.indexLabelText) {
            var newIndexLabelMaxWidth =
              dataPointEO.hemisphere === "right"
                ? plotArea.x2 - dataPointEO.indexLabelTextBlock.x
                : dataPointEO.indexLabelTextBlock.x - plotArea.x1;
            dataPointEO.indexLabelTextBlock.maxWidth * 0.3 >
            newIndexLabelMaxWidth
              ? (dataPointEO.indexLabelText = "")
              : (dataPointEO.indexLabelTextBlock.maxWidth =
                  newIndexLabelMaxWidth * 0.85);
            if (
              dataPointEO.indexLabelTextBlock.maxWidth * 0.3 <
              newIndexLabelMaxWidth
            )
              dataPointEO.indexLabelTextBlock.x -=
                dataPointEO.hemisphere === "right" ? 2 : -2;
          }

          if (
            Math.abs(
              dataPointEO.indexLabelTextBlock.y -
                dataPointEO.indexLabelTextBlock.height / 2 -
                center.y,
            ) < outerRadius ||
            Math.abs(
              dataPointEO.indexLabelTextBlock.y +
                dataPointEO.indexLabelTextBlock.height / 2 -
                center.y,
            ) < outerRadius
          ) {
            xdr = xOverflow / Math.abs(Math.cos(dataPointEO.indexLabelAngle));

            if (xdr > 9) xdr = xdr * 0.3;

            if (xdr > deltaR) deltaR = xdr;
          }
        }

        var yOverflow = 0;
        var ydr = 0;

        if (
          dataPointEO.indexLabelAngle > 0 &&
          dataPointEO.indexLabelAngle < Math.PI
        ) {
          yOverflow =
            plotArea.y2 -
            (dataPointEO.indexLabelTextBlock.y +
              dataPointEO.indexLabelTextBlock.height / 2 +
              5);
          yOverflow *= -1;
        } else {
          yOverflow =
            plotArea.y1 -
            (dataPointEO.indexLabelTextBlock.y -
              dataPointEO.indexLabelTextBlock.height / 2 -
              5);
        }

        if (yOverflow > 0) {
          if (!resizeFlag && dataPointEO.indexLabelText) {
            var positionMultiplier =
              dataPointEO.indexLabelAngle > 0 &&
              dataPointEO.indexLabelAngle < Math.PI
                ? -1
                : 1;
            if (rePositionLabels(i, yOverflow * positionMultiplier) === 0)
              rePositionLabels(i, 2 * positionMultiplier);
          }
          if (
            Math.abs(dataPointEO.indexLabelTextBlock.x - center.x) < outerRadius
          ) {
            ydr = yOverflow / Math.abs(Math.sin(dataPointEO.indexLabelAngle));

            if (ydr > 9) ydr = ydr * 0.3;

            if (ydr > deltaR) deltaR = ydr;
          }
        }
      }

      function removeLabelsForSmallSegments(
        totalOverlap,
        startIndex,
        endIndex,
      ) {
        var dpEOs = [];
        var totalRemovedLabelHeight = 0;

        for (
          var i = startIndex;
          true;
          i = (i + 1 + dataPoints.length) % dataPoints.length
        ) {
          dpEOs.push(dataPointEOs[i]);

          if (i === endIndex) break;
        }

        dpEOs.sort(function (entry1, entry2) {
          return entry1.y - entry2.y;
        });

        for (i = 0; i < dpEOs.length; i++) {
          var dpEO = dpEOs[i];

          if (totalRemovedLabelHeight < totalOverlap * 0.7) {
            totalRemovedLabelHeight += dpEO.indexLabelTextBlock.height;
            dpEO.indexLabelTextBlock.text = "";
            dpEO.indexLabelText = "";
            dpEO.indexLabelTextBlock.measureText();
          } else break;
        }
      }

      function skipLabels() {
        var overlapStartIndex = -1;
        var overlapEndIndex = -1;
        var totalOverlap = 0;
        var removeLabels = false;

        for (var k = 0; k < dataPoints.length; k++) {
          removeLabels = false;
          currentDataPoint = dataPointEOs[k];

          if (!currentDataPoint.indexLabelText) continue;

          var nextLabelIndex = getNextLabelIndex(k);
          if (nextLabelIndex === null) continue;

          var nextDataPoint = dataPointEOs[nextLabelIndex];

          distanceFromNextLabel = 0;

          distanceFromNextLabel = getVerticalDistanceBetweenLabels(
            currentDataPoint,
            nextDataPoint,
          );

          if (
            distanceFromNextLabel < 0 &&
            areDataPointsTooClose(currentDataPoint, nextDataPoint)
          ) {
            if (overlapStartIndex < 0) overlapStartIndex = k;

            if (nextLabelIndex !== overlapStartIndex) {
              overlapEndIndex = nextLabelIndex;

              totalOverlap += -distanceFromNextLabel;
            }

            if (k % Math.max(dataPoints.length / 10, 3) === 0)
              removeLabels = true;
          } else {
            removeLabels = true;
          }

          if (removeLabels) {
            if (
              totalOverlap > 0 &&
              overlapStartIndex >= 0 &&
              overlapEndIndex >= 0
            ) {
              removeLabelsForSmallSegments(
                totalOverlap,
                overlapStartIndex,
                overlapEndIndex,
              );

              overlapStartIndex = -1;
              overlapEndIndex = -1;
              totalOverlap = 0;
            }
          }
        }

        if (totalOverlap > 0)
          removeLabelsForSmallSegments(
            totalOverlap,
            overlapStartIndex,
            overlapEndIndex,
          );
      }

      skipLabels();
    }
  }

  this.pieDoughnutClickHandler = function (e) {
    if (_this.isAnimating) {
      return;
    }

    var dataPoint = e.dataPoint;
    var dataSeries = this;

    if (dataPoint.exploded) dataPoint.exploded = false;
    else dataPoint.exploded = true;

    if (dataSeries.dataPoints.length > 1) {
      _this._animator.animate(0, explodeDuration, function (fractionComplete) {
        explodeToggle(fractionComplete);
        renderChartElementsInPlotArea();
      });
    }

    return;
  };

  initLabels();

  positionLabels();
  positionLabels();
  positionLabels();
  positionLabels();

  this.disableToolTip = true;
  this._animator.animate(
    0,
    this.animatedRender ? this.animationDuration : 0,
    function (fractionComplete) {
      animate(fractionComplete);
      renderChartElementsInPlotArea();
    },
    function () {
      _this.disableToolTip = false;
      _this._animator.animate(
        0,
        _this.animatedRender ? explodeDuration : 0,
        function (fractionComplete) {
          explodeToggle(fractionComplete);
          renderChartElementsInPlotArea();
        },
      );
    },
  );

  function renderChartElementsInPlotArea() {
    _this.plotArea.layoutManager.reset();

    if (_this._title) {
      if (
        _this._title.dockInsidePlotArea ||
        (_this._title.horizontalAlign === "center" &&
          _this._title.verticalAlign === "center")
      )
        _this._title.render();
    }

    if (_this.subtitles)
      for (var i = 0; i < _this.subtitles.length; i++) {
        var subtitle = _this.subtitles[i];
        if (
          subtitle.dockInsidePlotArea ||
          (subtitle.horizontalAlign === "center" &&
            subtitle.verticalAlign === "center")
        )
          subtitle.render();
      }

    if (_this.legend) {
      if (
        _this.legend.dockInsidePlotArea ||
        (_this.legend.horizontalAlign === "center" &&
          _this.legend.verticalAlign === "center")
      )
        _this.legend.render();
    }
  }
}
