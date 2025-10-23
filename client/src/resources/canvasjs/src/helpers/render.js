const RenderHelper = {
  drawMarker: function (
    x,
    y,
    ctx,
    markerType,
    markerSize,
    markerColor,
    markerBorderColor,
    markerBorderThickness,
  ) {
    if (!ctx) return;

    var alpha = 1;

    ctx.fillStyle = markerColor ? markerColor : '#000000';
    ctx.strokeStyle = markerBorderColor ? markerBorderColor : '#000000';
    ctx.lineWidth = markerBorderThickness ? markerBorderThickness : 0;

    if (markerType === 'circle') {
      ctx.moveTo(x, y);
      ctx.beginPath();

      ctx.arc(x, y, markerSize / 2, 0, Math.PI * 2, false);

      if (markerColor) ctx.fill();

      if (markerBorderThickness) {
        if (!markerBorderColor) {
          alpha = ctx.globalAlpha;
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = 'black';
          ctx.stroke();
          ctx.globalAlpha = alpha;
        } else ctx.stroke();
      }
    } else if (markerType === 'square') {
      ctx.beginPath();
      ctx.rect(x - markerSize / 2, y - markerSize / 2, markerSize, markerSize);

      if (markerColor) ctx.fill();

      if (markerBorderThickness) {
        if (!markerBorderColor) {
          alpha = ctx.globalAlpha;
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = 'black';
          ctx.stroke();
          ctx.globalAlpha = alpha;
        } else ctx.stroke();
      }
    } else if (markerType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(x - markerSize / 2, y + markerSize / 2);
      ctx.lineTo(x + markerSize / 2, y + markerSize / 2);
      ctx.lineTo(x, y - markerSize / 2);
      ctx.closePath();

      if (markerColor) ctx.fill();

      if (markerBorderThickness) {
        if (!markerBorderColor) {
          alpha = ctx.globalAlpha;
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = 'black';
          ctx.stroke();
          ctx.globalAlpha = alpha;
        } else ctx.stroke();
      }
      ctx.beginPath();
    } else if (markerType === 'cross') {
      ctx.strokeStyle = markerColor;
      markerBorderThickness = markerSize / 4;
      ctx.lineWidth = markerBorderThickness;

      ctx.beginPath();
      ctx.moveTo(x - markerSize / 2, y - markerSize / 2);
      ctx.lineTo(x + markerSize / 2, y + markerSize / 2);
      ctx.stroke();

      ctx.moveTo(x + markerSize / 2, y - markerSize / 2);
      ctx.lineTo(x - markerSize / 2, y + markerSize / 2);
      ctx.stroke();
    }
  },
  drawMarkers: function (markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];

      RenderHelper.drawMarker(
        marker.x,
        marker.y,
        marker.ctx,
        marker.type,
        marker.size,
        marker.color,
        marker.borderColor,
        marker.borderThickness,
      );
    }
  },
};

export default RenderHelper;
