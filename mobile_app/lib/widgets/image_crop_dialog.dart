import 'dart:async';
import 'dart:math' as math;
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ImageCropDialog extends StatefulWidget {
  final Uint8List imageBytes;

  const ImageCropDialog({
    super.key,
    required this.imageBytes,
  });

  @override
  State<ImageCropDialog> createState() => _ImageCropDialogState();
}

class _ImageCropDialogState extends State<ImageCropDialog> {
  ui.Image? _uiImage;
  bool _loading = true;
  bool _exporting = false;

  // Zoom and translation states
  double _scale = 1.0;
  double _baseScale = 1.0;
  Offset _offset = Offset.zero;
  Offset _dragStartFocalPoint = Offset.zero;
  Offset _dragStartOffset = Offset.zero;

  // Limits
  double _minScale = 0.1;
  double _maxScale = 5.0;

  static const double cropSize = 240.0;
  static const double canvasSize = 300.0;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  Future<void> _loadImage() async {
    try {
      final codec = await ui.instantiateImageCodec(widget.imageBytes);
      final frame = await codec.getNextFrame();
      final img = frame.image;

      final fitScale = cropSize / math.min(img.width, img.height);
      final computedMinScale = (cropSize / math.max(img.width, img.height)) * 0.5;
      final computedMaxScale = (cropSize / math.min(img.width, img.height)) * 4.0;

      setState(() {
        _uiImage = img;
        _scale = fitScale.clamp(computedMinScale, computedMaxScale);
        _minScale = computedMinScale;
        _maxScale = computedMaxScale;
        _offset = Offset.zero;
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to parse image: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<Uint8List?> _cropAndExport() async {
    final img = _uiImage;
    if (img == null) return null;

    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);

    const outputSize = 512.0;
    const ratio = outputSize / cropSize;

    // 1. Draw circular clip path
    final clipPath = Path()..addOval(Rect.fromLTWH(0, 0, outputSize, outputSize));
    canvas.clipPath(clipPath);

    // 2. Draw image with scale and offset centered on the cropped circle
    final outCenterX = (outputSize / 2) + _offset.dx * ratio;
    final outCenterY = (outputSize / 2) + _offset.dy * ratio;
    final outW = img.width * _scale * ratio;
    final outH = img.height * _scale * ratio;

    canvas.drawImageRect(
      img,
      Rect.fromLTWH(0, 0, img.width.toDouble(), img.height.toDouble()),
      Rect.fromCenter(
        center: Offset(outCenterX, outCenterY),
        width: outW,
        height: outH,
      ),
      Paint()..filterQuality = ui.FilterQuality.high,
    );

    final picture = recorder.endRecording();
    final croppedImg = await picture.toImage(outputSize.toInt(), outputSize.toInt());
    final byteData = await croppedImg.toByteData(format: ui.ImageByteFormat.png);

    return byteData?.buffer.asUint8List();
  }

  Future<void> _cropAndDone() async {
    if (_uiImage == null || _exporting) return;
    setState(() {
      _exporting = true;
    });

    try {
      final croppedData = await _cropAndExport();
      if (mounted) {
        Navigator.of(context).pop(croppedData);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _exporting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Crop failed: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Dialog(
        backgroundColor: const Color(0xFF141420),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: const SizedBox(
          height: 200,
          child: Center(
            child: CircularProgressIndicator(color: Colors.indigoAccent),
          ),
        ),
      );
    }

    final img = _uiImage!;
    final sliderMin = math.min(_minScale, _maxScale);
    var sliderMax = math.max(_minScale, _maxScale);
    if (sliderMin == sliderMax) {
      sliderMax = sliderMin + 0.1;
    }
    final sliderVal = _scale.clamp(sliderMin, sliderMax);

    return Dialog(
      backgroundColor: const Color(0xFF141420),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Container(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Crop Profile Photo',
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Drag to reposition · Pinch or slide to zoom',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: Colors.white54,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 16),

            // Canvas Container
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: canvasSize,
                height: canvasSize,
                color: const Color(0xFF0F172A),
                child: GestureDetector(
                  onScaleStart: (details) {
                    _dragStartFocalPoint = details.localFocalPoint;
                    _dragStartOffset = _offset;
                    _baseScale = _scale;
                  },
                  onScaleUpdate: (details) {
                    setState(() {
                      if (details.pointerCount == 2) {
                        _scale = (_baseScale * details.scale).clamp(sliderMin, sliderMax);
                      }
                      final translation = details.localFocalPoint - _dragStartFocalPoint;
                      _offset = _dragStartOffset + translation;
                    });
                  },
                  child: CustomPaint(
                    size: const Size(canvasSize, canvasSize),
                    painter: ImagePreviewPainter(
                      image: img,
                      offset: _offset,
                      scale: _scale,
                      cropSize: cropSize,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Zoom Slider Row
            Row(
              children: [
                const Icon(Icons.zoom_out, color: Colors.white54, size: 18),
                Expanded(
                  child: Slider(
                    value: sliderVal,
                    min: sliderMin,
                    max: sliderMax,
                    activeColor: Colors.indigoAccent,
                    inactiveColor: Colors.white12,
                    onChanged: (val) {
                      setState(() {
                        _scale = val;
                      });
                    },
                  ),
                ),
                const Icon(Icons.zoom_in, color: Colors.white54, size: 18),
              ],
            ),
            const SizedBox(height: 16),

            // Actions Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      'Cancel',
                      style: GoogleFonts.outfit(
                        color: Colors.white70,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _exporting ? null : _cropAndDone,
                    child: _exporting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Apply Crop',
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ImagePreviewPainter extends CustomPainter {
  final ui.Image image;
  final Offset offset;
  final double scale;
  final double cropSize;

  ImagePreviewPainter({
    required this.image,
    required this.offset,
    required this.scale,
    required this.cropSize,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    final imgW = image.width * scale;
    final imgH = image.height * scale;
    final imgX = cx - imgW / 2 + offset.dx;
    final imgY = cy - imgH / 2 + offset.dy;

    // 1. Draw image
    canvas.save();
    canvas.drawImageRect(
      image,
      Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
      Rect.fromLTWH(imgX, imgY, imgW, imgH),
      Paint()..filterQuality = ui.FilterQuality.medium,
    );
    canvas.restore();

    // 2. Draw dark overlay outside crop circle
    canvas.save();
    final overlayPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.55)
      ..style = PaintingStyle.fill;

    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: cropSize / 2))
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, overlayPaint);
    canvas.restore();

    // 3. Draw circle border
    final borderPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(Offset(cx, cy), cropSize / 2, borderPaint);
  }

  @override
  bool shouldRepaint(covariant ImagePreviewPainter oldDelegate) {
    return oldDelegate.image != image ||
        oldDelegate.offset != offset ||
        oldDelegate.scale != scale ||
        oldDelegate.cropSize != cropSize;
  }
}
