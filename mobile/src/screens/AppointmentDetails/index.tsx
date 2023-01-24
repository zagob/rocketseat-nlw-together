import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, FlatList, Alert, Share, Platform } from 'react-native';
import bannerImg from '../../assets/banner.png';

import { api } from '../../services/api';

import { Fontisto } from "@expo/vector-icons";
import { BorderlessButton } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';

import { Background } from '../../components/Background';
import { Header } from '../../components/Header';
import { ListHeader } from '../../components/ListHeader';
import { ButtonIcon } from '../../components/ButtonIcon';

import { AppointmentsProps } from '../../components/Appointment';

import { styles } from './styles';
import { theme } from '../../global/styles/theme';
import { Member, MemberProps } from '../../components/Member';
import { ListDivider } from '../../components/ListDivider';
import { useRoute } from '@react-navigation/native';
import { Load } from '../../components/Load';


type Params = {
    guildSelected: AppointmentsProps
}

type GuildWidget = {
    id: string;
    name: string;
    instant_invite: string;
    members: MemberProps[];
    presence_count: number;
}

export function AppointmentDetails() {
    const [widget, setWidget] = useState<GuildWidget>({} as GuildWidget);
    const [loading, setLoading] = useState(true);
    const route = useRoute();
    const { guildSelected } = route.params as Params;

    async function FetchGuildInfo() {
        try {
            const response = await api.get(`/guilds/${guildSelected.guild.id}/widget.json`);
            setWidget(response.data);
            setLoading(false);
        } catch {
            Alert.alert('Verifica as configurações do servidor. Será que o Widget está habilitado?');
        } finally {
            setLoading(false);
        }
    }

    function handleShareInvitation() {
        const message = Platform.OS === 'ios'
            ? `Junte-se a ${guildSelected.guild.name}`
            : widget.instant_invite;

        Share.share({
            message,
            url: widget.instant_invite
        })
    }

    async function handleOpenGuild() {
        await Linking.openURL(widget.instant_invite);
    }

    useEffect(() => {
        FetchGuildInfo();
    }, []);

    return (
        <Background>
            <Header
                title="Detalhes"
                action={
                    guildSelected.guild.owner &&
                    <BorderlessButton onPress={handleShareInvitation}>
                        <Fontisto
                            name="share"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </BorderlessButton>
                }
            />

            <ImageBackground
                source={bannerImg}
                style={styles.banner}
            >
                <View style={styles.bannerContent}>
                    <Text style={styles.title}>
                        {guildSelected.guild.name}
                    </Text>
                    <Text style={styles.subtitle}>
                        {guildSelected.description}
                    </Text>
                </View>
            </ImageBackground>

            {
                loading ? (
                    <Load />
                ) : (
                    <>
                        <ListHeader
                            title="Jogadores"
                            subtitle={`Total ${widget.members.length}`}
                        />

                        <FlatList
                            data={widget.members}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <Member
                                    data={item}
                                />
                            )}
                            ItemSeparatorComponent={() => <ListDivider isCentered />}
                            style={styles.members}
                        />
                    </>
                )
            }

            {
                guildSelected.guild.owner &&
                <View style={styles.footer}>
                    <ButtonIcon title="Entrar na partida" onPress={handleOpenGuild} />
                </View>
            }
        </Background>
    );
}