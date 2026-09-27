/*
 * ============================================================
 * SolarSync - Provider Dashboard (Flutter)
 * ============================================================
 * File: mobile_app/lib/screens/provider_dashboard.dart
 * Purpose: Energy production monitoring, consumer management,
 *          and revenue tracking for solar energy providers.
 * ============================================================
 */

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class ProviderDashboard extends StatefulWidget {
  final String deviceId;
  final String token;
  final String userName;

  const ProviderDashboard({
    Key? key,
    required this.deviceId,
    required this.token,
    required this.userName,
  }) : super(key: key);

  @override
  _ProviderDashboardState createState() => _ProviderDashboardState();
}

class _ProviderDashboardState extends State<ProviderDashboard> {
  // State variables
  double solarProduction = 0;
  double homeUsage = 0;
  double exportAvailable = 0;
  double monthlyEarnings = 0;
  double todayEarnings = 0;
  bool isLoading = true;
  List<ConsumerData> consumers = [];

  Timer? _updateTimer;

  static const String _baseUrl = 'http://10.0.2.2:3000/api';

  @override
  void initState() {
    super.initState();
    _loadData();
    _startPeriodicUpdates();
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    super.dispose();
  }

  void _startPeriodicUpdates() {
    _updateTimer = Timer.periodic(Duration(seconds: 5), (timer) {
      _fetchProviderSummary();
    });
  }

  Future<void> _loadData() async {
    try {
      await _fetchProviderSummary();
      setState(() => isLoading = false);
    } catch (e) {
      print('Error loading provider data: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> _fetchProviderSummary() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/provider/summary'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        setState(() {
          monthlyEarnings = data['monthlyEarnings']?.toDouble() ?? 0;
          todayEarnings = data['todayEarnings']?.toDouble() ?? 0;
          
          // Parse consumers
          consumers = (data['consumers'] as List? ?? []).map((c) => ConsumerData(
            userId: c['user_id'],
            name: c['name'] ?? 'Unknown',
            deviceId: c['device_id'] ?? '',
            walletBalance: c['wallet_balance']?.toDouble() ?? 0,
            isActive: c['device_status'] == 'online',
            relayState: c['relay_state'] ?? false,
            lastSeen: c['last_seen'] != null 
                ? DateTime.tryParse(c['last_seen']) 
                : null,
          )).toList();

          // Simulate solar data (in real app, this comes from solar inverter)
          solarProduction = 1100 + (DateTime.now().second * 2.0);
          homeUsage = 350 + (DateTime.now().minute * 0.5);
          exportAvailable = solarProduction - homeUsage;
        });
      }
    } catch (e) {
      print('Error fetching provider summary: $e');
    }
  }

  Future<void> _toggleConsumerConnection(ConsumerData consumer) async {
    try {
      final String endpoint = consumer.isActive
          ? '$_baseUrl/device/disconnect'
          : '$_baseUrl/device/restore';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'targetDeviceId': consumer.deviceId,
          'reason': 'Provider ${consumer.isActive ? "disconnected" : "restored"}',
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          final index = consumers.indexWhere((c) => c.userId == consumer.userId);
          if (index != -1) {
            consumers[index] = ConsumerData(
              userId: consumer.userId,
              name: consumer.name,
              deviceId: consumer.deviceId,
              walletBalance: consumer.walletBalance,
              isActive: !consumer.isActive,
              relayState: !consumer.isActive,
              lastSeen: consumer.lastSeen,
            );
          }
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(consumer.isActive 
                ? '${consumer.name} को डिस्कनेक्ट किया गया' 
                : '${consumer.name} को पुनः कनेक्ट किया गया'),
            backgroundColor: consumer.isActive ? Colors.orange : Colors.green,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('त्रुटि: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: _buildAppBar(),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: Colors.amber[700]))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSolarStatusCard(),
                    SizedBox(height: 16),
                    _buildConnectedConsumers(),
                    SizedBox(height: 16),
                    _buildPerformanceCard(),
                    SizedBox(height: 80),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 1,
      title: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.amber[100],
            radius: 18,
            child: Icon(Icons.wb_sunny, color: Colors.amber[800], size: 20),
          ),
          SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'प्रदाता डैशबोर्ड',
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
          padding: EdgeInsets.only(right: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('इस माह की कमाई', style: TextStyle(fontSize: 10, color: Colors.amber[600])),
              Text(
                '₹ ${monthlyEarnings.toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.amber[800],
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSolarStatusCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.amber[50]!, Colors.orange[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber[100]!),
      ),
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.wb_sunny, color: Colors.amber[700], size: 20),
              SizedBox(width: 8),
              Text(
                'सोलर स्थिति',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.amber[800]),
              ),
            ],
          ),
          SizedBox(height: 16),
          Row(
            children: [
              _buildSolarStat('उत्पादन', solarProduction, Colors.amber),
              SizedBox(width: 8),
              _buildSolarStat('घरेलू उपयोग', homeUsage, Colors.blue),
              SizedBox(width: 8),
              _buildSolarStat('निर्यात उपलब्ध', exportAvailable, Colors.green),
            ],
          ),
          SizedBox(height: 16),
          // Energy flow visualization
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('☀️ सोलर', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                    Text('→', style: TextStyle(color: Colors.grey[400])),
                    Text('🏠 घर', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                    Text('→', style: TextStyle(color: Colors.grey[400])),
                    Text('🔌 उपभोक्ता', style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                  ],
                ),
                SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: SizedBox(
                    height: 12,
                    child: Row(
                      children: [
                        Expanded(
                          flex: (homeUsage / solarProduction * 100).round().clamp(1, 100),
                          child: Container(color: Colors.blue[400]),
                        ),
                        Expanded(
                          flex: (exportAvailable / solarProduction * 100).round().clamp(1, 100),
                          child: Container(color: Colors.green[500]),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'घरेलू (${(homeUsage / solarProduction * 100).toStringAsFixed(0)}%)',
                      style: TextStyle(fontSize: 10, color: Colors.blue[600]),
                    ),
                    Text(
                      'निर्यात (${(exportAvailable / solarProduction * 100).toStringAsFixed(0)}%)',
                      style: TextStyle(fontSize: 10, color: Colors.green[600]),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSolarStat(String label, double value, MaterialColor color) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(label, style: TextStyle(fontSize: 10, color: Colors.grey[500])),
            SizedBox(height: 4),
            Text(
              value.toStringAsFixed(0),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color[700],
                fontFamily: 'monospace',
              ),
            ),
            Text('Watts', style: TextStyle(fontSize: 9, color: Colors.grey[400])),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectedConsumers() {
    final activeCount = consumers.where((c) => c.isActive).length;
    
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
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'सक्रिय कनेक्शन ($activeCount/${consumers.length})',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700]),
              ),
              Text(
                'आज: ₹${todayEarnings.toStringAsFixed(0)}',
                style: TextStyle(fontSize: 12, color: Colors.grey[400]),
              ),
            ],
          ),
          SizedBox(height: 12),
          ...consumers.map((consumer) => _buildConsumerTile(consumer)),
        ],
      ),
    );
  }

  Widget _buildConsumerTile(ConsumerData consumer) {
    return Container(
      margin: EdgeInsets.only(bottom: 10),
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: consumer.isActive ? Colors.green[100] : Colors.grey[200],
                    radius: 18,
                    child: Icon(
                      Icons.person,
                      color: consumer.isActive ? Colors.green[700] : Colors.grey[500],
                      size: 18,
                    ),
                  ),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        consumer.name,
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[800]),
                      ),
                      Text(
                        consumer.deviceId.toUpperCase(),
                        style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ],
              ),
              // Toggle Switch
              Switch(
                value: consumer.isActive,
                onChanged: (_) => _toggleConsumerConnection(consumer),
                activeColor: Colors.green[700],
                inactiveThumbColor: Colors.grey[400],
                inactiveTrackColor: Colors.grey[200],
              ),
            ],
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: consumer.isActive ? Colors.green[100] : Colors.red[100],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: consumer.isActive ? Colors.green[500] : Colors.red[500],
                            shape: BoxShape.circle,
                          ),
                        ),
                        SizedBox(width: 4),
                        Text(
                          consumer.isActive ? 'सक्रिय' : 'रोका गया',
                          style: TextStyle(
                            fontSize: 11,
                            color: consumer.isActive ? Colors.green[700] : Colors.red[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'वॉलेट: ₹${consumer.walletBalance.toStringAsFixed(0)}',
                    style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                  ),
                ],
              ),
              if (consumer.lastSeen != null)
                Text(
                  _getTimeAgo(consumer.lastSeen!),
                  style: TextStyle(fontSize: 10, color: Colors.grey[400]),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceCard() {
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
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'आज का प्रदर्शन',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700]),
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '12.5',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green[700], fontFamily: 'monospace'),
                      ),
                      Text('कुल Units निर्यात', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                    ],
                  ),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber[50],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '₹${todayEarnings.toStringAsFixed(0)}',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.amber[700], fontFamily: 'monospace'),
                      ),
                      Text('आज की कमाई', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
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
        selectedItemColor: Colors.amber[700],
        unselectedItemColor: Colors.grey[400],
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'होम'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'रिपोर्ट'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'सेटिंग्स'),
        ],
      ),
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 1) return 'अभी';
    if (diff.inMinutes < 60) return '${diff.inMinutes} मि पहले';
    if (diff.inHours < 24) return '${diff.inHours} घं पहले';
    return '${diff.inDays} दिन पहले';
  }
}

// Data model for consumer
class ConsumerData {
  final int userId;
  final String name;
  final String deviceId;
  final double walletBalance;
  final bool isActive;
  final bool relayState;
  final DateTime? lastSeen;

  ConsumerData({
    required this.userId,
    required this.name,
    required this.deviceId,
    required this.walletBalance,
    required this.isActive,
    required this.relayState,
    this.lastSeen,
  });
}
