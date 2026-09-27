/*
 * ============================================================
 * SolarSync - Consumer Dashboard (Flutter)
 * ============================================================
 * File: mobile_app/lib/screens/consumer_dashboard.dart
 * Purpose: Real-time energy consumption tracking, wallet 
 *          management, and supply control for consumers.
 * ============================================================
 */

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class ConsumerDashboard extends StatefulWidget {
  final String deviceId;
  final String token;
  final String userName;

  const ConsumerDashboard({
    Key? key,
    required this.deviceId,
    required this.token,
    required this.userName,
  }) : super(key: key);

  @override
  _ConsumerDashboardState createState() => _ConsumerDashboardState();
}

class _ConsumerDashboardState extends State<ConsumerDashboard> {
  // State variables
  double walletBalance = 0.0;
  double currentLoad = 0.0;
  double currentRate = 6.50;
  double deductionPerSecond = 0.0;
  bool isSupplyActive = true;
  bool isLoading = true;
  bool showPriceAlert = false;
  double upcomingRate = 0.0;
  int alertCountdownMinutes = 0;

  // Timer for periodic updates
  Timer? _updateTimer;
  Timer? _blinkTimer;
  bool _blinkState = false;

  // API Base URL (Change for production)
  static const String _baseUrl = 'http://10.0.2.2:3000/api';

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _startPeriodicUpdates();
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    _blinkTimer?.cancel();
    super.dispose();
  }

  // ==================== DATA LOADING ====================

  Future<void> _loadInitialData() async {
    try {
      await Future.wait([
        _fetchWalletBalance(),
        _fetchLiveData(),
        _fetchPricingInfo(),
      ]);
      setState(() => isLoading = false);
    } catch (e) {
      print('Error loading initial data: $e');
      setState(() => isLoading = false);
    }
  }

  void _startPeriodicUpdates() {
    _updateTimer = Timer.periodic(Duration(seconds: 5), (timer) {
      _fetchLiveData();
      _fetchWalletBalance();
    });
  }

  Future<void> _fetchWalletBalance() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/wallet/${widget.deviceId}'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          walletBalance = data['balance']?.toDouble() ?? 0.0;
        });
      }
    } catch (e) {
      print('Error fetching wallet: $e');
    }
  }

  Future<void> _fetchLiveData() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/consumer/live/${widget.deviceId}'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          currentLoad = data['liveData']?['power']?.toDouble() ?? 0.0;
          currentRate = data['pricing']?['currentRate']?.toDouble() ?? 6.50;
          deductionPerSecond = data['pricing']?['deductionPerSecond']?.toDouble() ?? 0.0;
          isSupplyActive = data['wallet']?['relayState'] ?? true;
        });
      }
    } catch (e) {
      print('Error fetching live data: $e');
    }
  }

  Future<void> _fetchPricingInfo() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/pricing/current'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        // Check if rate is changing soon
        final lastChangeTime = data['lastChangeTime'];
        if (lastChangeTime != null) {
          final changeTime = DateTime.fromMillisecondsSinceEpoch(lastChangeTime);
          final now = DateTime.now();
          final diffMinutes = changeTime.difference(now).inMinutes;
          if (diffMinutes > 0 && diffMinutes <= 30) {
            setState(() {
              showPriceAlert = true;
              upcomingRate = data['currentRate']?.toDouble() ?? 0.0;
              alertCountdownMinutes = diffMinutes;
            });
          }
        }
      }
    } catch (e) {
      print('Error fetching pricing: $e');
    }
  }

  // ==================== ACTIONS ====================

  Future<void> _toggleSupply() async {
    try {
      final String endpoint = isSupplyActive 
          ? '$_baseUrl/device/disconnect' 
          : '$_baseUrl/device/restore';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'targetDeviceId': widget.deviceId,
          'reason': 'User initiated ${isSupplyActive ? "pause" : "resume"}',
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          isSupplyActive = !isSupplyActive;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isSupplyActive 
                ? '✅ आपूर्ति पुनः प्रारंभ की गई' 
                : '⏸ आपूर्ति अस्थायी रूप से रोकी गई'),
            backgroundColor: isSupplyActive ? Colors.green : Colors.orange,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: ${e.toString()}')),
      );
    }
  }

  Future<void> _rechargeWallet() async {
    final controller = TextEditingController();
    int? selectedAmount;

    await showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(Icons.account_balance_wallet, color: Colors.green[700]),
              SizedBox(width: 8),
              Text('वॉलेट रिचार्ज', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Quick amount buttons
              Row(
                children: [100, 200, 500, 1000].map((amount) => 
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4),
                      child: ElevatedButton(
                        onPressed: () {
                          setDialogState(() {
                            selectedAmount = amount;
                            controller.text = amount.toString();
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: selectedAmount == amount 
                              ? Colors.green[700] 
                              : Colors.grey[200],
                          foregroundColor: selectedAmount == amount 
                              ? Colors.white 
                              : Colors.black87,
                          padding: EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text('₹$amount', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ).toList(),
              ),
              SizedBox(height: 16),
              TextField(
                controller: controller,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'राशि दर्ज करें',
                  prefixText: '₹ ',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.green[700]!, width: 2),
                  ),
                ),
                onChanged: (value) {
                  setDialogState(() {
                    selectedAmount = null;
                  });
                },
              ),
              SizedBox(height: 12),
              Text(
                'GPay | PhonePe | Paytm | किसी भी UPI ऐप से',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('रद्द करें', style: TextStyle(color: Colors.grey[600])),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(controller.text) ?? 0;
                if (amount > 0) {
                  Navigator.pop(context);
                  await _processRecharge(amount);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[700],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text('रिचार्ज करें', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processRecharge(double amount) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: CircularProgressIndicator(color: Colors.green[700]),
        ),
      );

      final response = await http.post(
        Uri.parse('$_baseUrl/wallet/recharge'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'deviceId': widget.deviceId,
          'amount': amount,
          'paymentMethod': 'upi',
        }),
      );

      Navigator.pop(context); // Dismiss loading

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          walletBalance = data['newBalance']?.toDouble() ?? walletBalance + amount;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ ₹${amount.toStringAsFixed(0)} सफलतापूर्वक जोड़े गए'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        throw Exception('Recharge failed');
      }
    } catch (e) {
      Navigator.pop(context); // Dismiss loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ रिचार्ज विफल: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ==================== CALCULATIONS ====================

  String get _estimatedTimeRemaining {
    if (deductionPerSecond <= 0 || walletBalance <= 0) return 'N/A';
    final totalSeconds = walletBalance / deductionPerSecond;
    final hours = (totalSeconds / 3600).floor();
    final minutes = ((totalSeconds % 3600) / 60).floor();
    if (hours > 0) {
      return '$hours घंटे $minutes मिनट';
    }
    return '$minutes मिनट';
  }

  double get _walletProgressPercent {
    // Assume 1000 Rs is "full" for progress bar
    return (walletBalance / 1000).clamp(0.0, 1.0);
  }

  Color get _walletProgressColor {
    if (_walletProgressPercent > 0.5) return Colors.green;
    if (_walletProgressPercent > 0.2) return Colors.orange;
    return Colors.red;
  }

  // ==================== BUILD ====================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: _buildAppBar(),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: Colors.green[700]))
          : RefreshIndicator(
              onRefresh: _loadInitialData,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildLiveStatusCard(),
                    SizedBox(height: 12),
                    if (showPriceAlert) _buildPriceAlertBanner(),
                    if (showPriceAlert) SizedBox(height: 12),
                    _buildSupplyControlButton(),
                    SizedBox(height: 16),
                    _buildTodaySummary(),
                    SizedBox(height: 16),
                    _buildQuickActions(),
                    SizedBox(height: 80), // Space for bottom nav
                  ],
                ),
              ),
            ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ==================== WIDGETS ====================

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 1,
      title: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.green[100],
            radius: 18,
            child: Icon(Icons.person, color: Colors.green[800], size: 20),
          ),
          SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'उपभोक्ता डैशबोर्ड',
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
              Text(
                widget.userName,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[800]),
              ),
            ],
          ),
        ],
      ),
      actions: [
        Padding(
          padding: EdgeInsets.only(right: 8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('वॉलेट', style: TextStyle(fontSize: 10, color: Colors.green[600])),
              Text(
                '₹ ${walletBalance.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.green[800],
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: _rechargeWallet,
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.green[700],
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.3),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(Icons.add, color: Colors.white, size: 20),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLiveStatusCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status indicator
          Row(
            children: [
              AnimatedContainer(
                duration: Duration(milliseconds: 500),
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: isSupplyActive ? Colors.green : Colors.red,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: (isSupplyActive ? Colors.green : Colors.red).withOpacity(0.4),
                      blurRadius: 6,
                    ),
                  ],
                ),
              ),
              SizedBox(width: 8),
              Text(
                isSupplyActive ? '🟢 सक्रिय आपूर्ति' : '🔴 आपूर्ति बंद',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isSupplyActive ? Colors.green[700] : Colors.red[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          
          // Stats grid
          Row(
            children: [
              Expanded(
                child: _buildStatBox('वर्तमान लोड', '${currentLoad.toStringAsFixed(0)} W', Colors.blue),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _buildStatBox('वर्तमान दर', '₹${currentRate.toStringAsFixed(2)}/Unit', Colors.purple),
              ),
            ],
          ),
          SizedBox(height: 12),
          
          // Deduction rate
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('कटौती दर', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                Text(
                  '-₹ ${deductionPerSecond.toStringAsFixed(4)} / सेकंड',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.red[600],
                    fontFamily: 'monospace',
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 16),
          
          // Progress bar
          Text(
            'वॉलेट शेष अनुमान',
            style: TextStyle(fontSize: 12, color: Colors.grey[500]),
          ),
          SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: _walletProgressPercent,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(_walletProgressColor),
              minHeight: 8,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'वर्तमान खपत पर वॉलेट $_estimatedTimeRemaining में समाप्त होगा।',
            style: TextStyle(fontSize: 11, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
          SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceAlertBanner() {
    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.amber[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber[200]!),
      ),
      child: Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: Colors.amber[700], size: 24),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'डायनामिक प्राइसिंग सूचना',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.amber[800]),
                ),
                SizedBox(height: 2),
                Text(
                  'अगले $alertCountdownMinutes मिनट में दर ₹${upcomingRate.toStringAsFixed(2)}/Unit हो जाएगी।',
                  style: TextStyle(fontSize: 11, color: Colors.amber[700]),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.close, size: 18, color: Colors.amber[600]),
            onPressed: () => setState(() => showPriceAlert = false),
            padding: EdgeInsets.zero,
            constraints: BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildSupplyControlButton() {
    return ElevatedButton(
      onPressed: _toggleSupply,
      style: ElevatedButton.styleFrom(
        backgroundColor: isSupplyActive ? Colors.red[600] : Colors.green[700],
        foregroundColor: Colors.white,
        padding: EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 4,
        shadowColor: (isSupplyActive ? Colors.red : Colors.green).withOpacity(0.3),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSupplyActive ? Icons.pause_circle_filled : Icons.play_circle_filled,
            size: 24,
          ),
          SizedBox(width: 8),
          Text(
            isSupplyActive ? 'आपूर्ति अस्थायी रूप से रोकें' : 'आपूर्ति पुनः प्रारंभ करें',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaySummary() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'आज का सारांश',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700]),
          ),
          SizedBox(height: 12),
          Row(
            children: [
              _buildSummaryItem('4.2', 'Units उपभोग', Colors.green),
              _buildSummaryItem('₹27.30', 'आज का खर्च', Colors.blue),
              _buildSummaryItem('6.5', 'औसत दर', Colors.purple),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
              fontFamily: 'monospace',
            ),
          ),
          SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: _buildActionButton(
            icon: Icons.history,
            label: 'इतिहास',
            color: Colors.blue,
            onTap: () {
              // Navigate to transaction history
            },
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: _buildActionButton(
            icon: Icons.support_agent,
            label: 'सहायता',
            color: Colors.orange,
            onTap: () {
              // Navigate to support
            },
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            SizedBox(width: 8),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.green[700],
        unselectedItemColor: Colors.grey[400],
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'होम'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'इतिहास'),
          BottomNavigationBarItem(icon: Icon(Icons.headset_mic), label: 'सहायता'),
        ],
      ),
    );
  }
}

// Helper widget for animated container
class AnimatedContainer extends StatelessWidget {
  final Duration duration;
  final double width;
  final double height;
  final BoxDecoration decoration;

  const AnimatedContainer({
    Key? key,
    required this.duration,
    required this.width,
    required this.height,
    required this.decoration,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: duration,
      width: width,
      height: height,
      decoration: decoration,
    );
  }
}
