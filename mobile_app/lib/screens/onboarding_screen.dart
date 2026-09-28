/*
 * ============================================================
 * SolarSync - Onboarding & Legal Consent Screen (Flutter)
 * ============================================================
 * File: mobile_app/lib/screens/onboarding_screen.dart
 * Purpose: App introduction and legal agreement acceptance
 * ============================================================
 */

import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onAgreementAccepted;

  const OnboardingScreen({
    Key? key,
    required this.onAgreementAccepted,
  }) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _agreed = false;
  String _selectedRole = 'consumer';
  int _currentStep = 0;

  final List<Map<String, dynamic>> _steps = [
    {
      'icon': Icons.account_balance_wallet,
      'title': 'वॉलेट रिचार्ज करें',
      'subtitle': 'UPI से आसान और सुरक्षित रिचार्ज',
      'color': Colors.green,
    },
    {
      'icon': Icons.electrical_services,
      'title': 'वास्तविक समय में ऊर्जा उपयोग करें',
      'subtitle': 'लाइव खपत और बचत देखें',
      'color': Colors.blue,
    },
    {
      'icon': Icons.verified_user,
      'title': '100% प्रमाणित मीटरिंग',
      'subtitle': 'NABL-कैलिब्रेटेड सेंसर द्वारा सटीक माप',
      'color': Colors.purple,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.green[50]!, Colors.white],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2E7D32),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.wb_sunny,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'SolarSync',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.green[800],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'स्वच्छ ऊर्जा, पारदर्शी साझाकरण',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.green[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Steps / Features
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 16),
                    // Step indicators
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(3, (index) => 
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentStep == index ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentStep == index 
                                ? Colors.green[700] 
                                : Colors.grey[300],
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Current step content
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: _buildStepContent(_currentStep),
                    ),
                  ],
                ),
              ),
            ),

            // Agreement & Button
            Expanded(
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Agreement checkbox
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.green[100]!),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 24,
                            height: 24,
                            child: Checkbox(
                              value: _agreed,
                              onChanged: (value) {
                                setState(() => _agreed = value ?? false);
                              },
                              activeColor: Colors.green[700],
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _agreed = !_agreed),
                              child: Text(
                                'मैं \'साझा हरित ऊर्जा इंफ्रास्ट्रक्चर समझौते\' की शर्तों से सहमत हूँ। मैं समझता हूँ कि यह मेंटेनेंस एवं एक्सेस चार्ज है।',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: () {
                          // Show full agreement
                        },
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'पूरा समझौता पढ़ें →',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.green[700],
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Proceed button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _agreed ? widget.onAgreementAccepted : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: Colors.grey[300],
                          disabledForegroundColor: Colors.grey[500],
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                          shadowColor: Colors.green.withOpacity(0.3),
                        ),
                        child: Text(
                          _agreed ? 'सहमत हूँ और आगे बढ़ें →' : 'कृपया समझौते से सहमत हों',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(int step) {
    final data = _steps[step];
    return Container(
      key: ValueKey(step),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: (data['color'] as MaterialColor).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              data['icon'] as IconData,
              color: data['color'] as Color,
              size: 28,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            data['title'] as String,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            data['subtitle'] as String,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          // Navigation dots/arrows
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (step > 0)
                IconButton(
                  onPressed: () => setState(() => _currentStep--),
                  icon: Icon(Icons.arrow_back_ios, size: 16, color: Colors.grey[600]),
                ),
              if (step < _steps.length - 1)
                IconButton(
                  onPressed: () => setState(() => _currentStep++),
                  icon: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.green[700]),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
