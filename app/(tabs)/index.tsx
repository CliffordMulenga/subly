import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  const { user } = useUser();

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const displayName = useMemo(() => {
    const firstName = user?.firstName?.trim();
    const lastName = user?.lastName?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    return null;
  }, [user?.firstName, user?.lastName]);

  const displayEmail = useMemo(() => {
    return user?.primaryEmailAddress?.emailAddress ?? null;
  }, [user?.primaryEmailAddress?.emailAddress]);

  const avatarSource = useMemo(() => {
    if (user?.imageUrl) return { uri: user.imageUrl };
    return images.avatar;
  }, [user?.imageUrl]);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={avatarSource} className="home-avatar" />
                  <View className="ml-4 min-w-0 flex-1">
                    <Text className="text-2xl font-sans-bold text-primary" numberOfLines={1}>
                      {displayName ?? displayEmail ?? HOME_USER.name}
                    </Text>
                    {!displayName && !!displayEmail && (
                      <View className="mt-1 flex-row flex-wrap items-center gap-1">
                        <Text className="text-xs font-sans-medium text-muted-foreground">
                          Complete your profile in
                        </Text>
                        <Link href="/settings" asChild>
                          <Pressable>
                            <Text className="text-xs font-sans-bold text-accent">Settings</Text>
                          </Pressable>
                        </Link>
                      </View>
                    )}
                  </View>
                </View>

                <Image source={icons.add} className="home-add-icon" />
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>

                <View className="home-balance-row">
                  <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                  <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
                </View>
              </View>

              <View>
                <ListHeading title={'Upcoming'} />
                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />

                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                />

              </View>

              <ListHeading title={'All Subscriptions'} />

            </>
          )}

          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}

          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => setExpandedSubscriptionId((currentId) => (
                currentId === item.id ? null : item.id
              ))}
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-30"
        />

    </SafeAreaView>
  );
}
