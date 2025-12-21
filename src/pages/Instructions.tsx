import { Heart, Brain, Moon, Users, Focus, Lightbulb, Shield, Smartphone } from "lucide-react";
import { DATA_VERSION } from "../hooks/useEntries";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-medium text-stone-900 mb-4">About 3Good</h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          A mindful practice in daily gratitude — built with intention for those who value
          thoughtful reflection over endless productivity.
        </p>
      </div>

      {/* Philosophy */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-8">
        <h2 className="text-lg font-medium text-stone-900 mb-4">The Practice</h2>
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed mb-4">
            Each day brings moments worth appreciating — some small, others profound. This simple
            practice asks you to pause and notice what you're grateful for today.
          </p>
          <p className="text-stone-700 leading-relaxed">
            Not to force positivity, but to train attention. To build the habit of noticing good
            alongside difficulty. To create a record of appreciation that grows over time.
          </p>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-stone-900 mb-6">Why This Matters</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain size={20} className="text-stone-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">Mental Clarity</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Regular gratitude practice reduces mental noise and builds resilience against
                  stress and overwhelm.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Moon size={20} className="text-stone-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">Better Rest</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Ending the day with gratitude creates mental space for deeper, more restorative
                  sleep.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-stone-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">Deeper Connection</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Noticing kindness and connection strengthens relationships and builds empathy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Focus size={20} className="text-stone-600" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900 mb-1">Trained Attention</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Like meditation, this practice gradually shifts what you notice in daily life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-stone-50 rounded-2xl p-8 mb-8">
        <h2 className="text-lg font-medium text-stone-900 mb-6">How to Practice</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-stone-900 mb-2">Notice Today's Good</h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                Each day, think about what you're grateful for right now. What moments brought you
                joy, satisfaction, or peace? They can be small (good coffee) or significant
                (meaningful conversation).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-stone-900 mb-2">Be Specific</h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                Instead of "nice weather," try "the way afternoon light fell across my desk."
                Specificity makes memories more vivid and meaningful.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-stone-900 mb-2">Mark What Matters</h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                Star the moments that feel especially significant. These become touchstones —
                reminders of what brings you alive.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-medium text-stone-900 mb-2">Stay Consistent</h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                Like any practice, consistency matters more than perfection. Even a few minutes
                daily builds the habit of noticing good.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gentle Guidance */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-amber-600" />
          <h2 className="text-lg font-medium text-stone-900">Gentle Guidance</h2>
        </div>
        <div className="space-y-3 text-sm text-stone-700">
          <p>
            • <strong>Include variety:</strong> Mix profound moments with simple pleasures
          </p>
          <p>
            • <strong>Notice people:</strong> Gratitude for relationships tends to be most
            meaningful
          </p>
          <p>
            • <strong>Find your rhythm:</strong> Some prefer morning reflection, others evening
          </p>
          <p>
            • <strong>Avoid repetition:</strong> Challenge yourself to find new things each day
          </p>
          <p>
            • <strong>Review occasionally:</strong> Your journal becomes a record of accumulated
            gratitude
          </p>
          <p>
            • <strong>Be patient:</strong> The benefits of this practice compound over time
          </p>
        </div>
      </div>

      {/* Built With Care */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8">
        <h2 className="text-lg font-medium text-stone-900 mb-6">Built With Care</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">Privacy First</h3>
                <p className="text-sm text-stone-600">Your reflections stay on your device</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Heart size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">No Tracking</h3>
                <p className="text-sm text-stone-600">No analytics, ads, or data collection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">Works Everywhere</h3>
                <p className="text-sm text-stone-600">Responsive design for any device</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Focus size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">Distraction-Free</h3>
                <p className="text-sm text-stone-600">Clean interface, no unnecessary features</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Brain size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">Export Ready</h3>
                <p className="text-sm text-stone-600">Your data, in formats you can use</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users size={18} className="text-stone-600" />
              <div>
                <h3 className="font-medium text-stone-900">Open Source</h3>
                <p className="text-sm text-stone-600">Transparent, community-driven</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-2">
            Created by a frontend developer who believes in building focused, thoughtful tools for
            mindful living.
          </p>
          <p className="text-xs text-stone-500">Version {DATA_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
